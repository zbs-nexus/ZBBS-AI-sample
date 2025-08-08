<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { generateParticipantId } from '../utils/idGenerator';

const client = generateClient<Schema>();

const props = defineProps<{
  eventId: string | null;
  user: any;
}>();

const emit = defineEmits<{
  back: [];
}>();

const event = ref<Schema['Event']['type'] | null>(null);
const participants = ref<Array<Schema['EventParticipant']['type']>>([]);
const participantProfiles = ref<Array<Schema['UserProfile']['type']>>([]);
const isParticipating = ref(false);

const participantCount = computed(() => participants.value.length);
const canJoin = computed(() => 
  event.value && (!event.value.maxParticipants || participantCount.value < event.value.maxParticipants)
);

function loadEvent() {
  if (!props.eventId) return;
  
  client.models.Event.get({ id: props.eventId }).then(({ data }) => {
    event.value = data;
  });
  
  client.models.EventParticipant.observeQuery({
    filter: { eventId: { eq: props.eventId } }
  }).subscribe({
    next: ({ items }) => {
      participants.value = items;
      isParticipating.value = items.some(p => p.userId === props.user.userId);
      loadParticipantProfiles(items);
    }
  });
}

function loadParticipantProfiles(participantList: Array<Schema['EventParticipant']['type']>) {
  const userIds = participantList.map(p => p.userId);
  
  if (userIds.length === 0) {
    participantProfiles.value = [];
    return;
  }
  
  client.models.UserProfile.list().then(({ data }) => {
    participantProfiles.value = data.filter(profile => userIds.includes(profile.userId));
  });
}

async function joinEvent() {
  if (!props.eventId || !canJoin.value) return;
  
  const customId = await generateParticipantId();
  client.models.EventParticipant.create({
    id: customId,
    eventId: props.eventId,
    userId: props.user.userId
  });
}

function leaveEvent() {
  if (!props.eventId) return;
  
  const participation = participants.value.find(p => p.userId === props.user.userId);
  if (participation) {
    client.models.EventParticipant.delete({ id: participation.id });
  }
}

onMounted(() => {
  loadEvent();
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 0.5rem; box-sizing: border-box;">
    <button @click="emit('back')" style="margin-bottom: 0.5rem; padding: 0.3rem 0.6rem; font-size: 0.9rem;">← 戻る</button>
    
    <div v-if="event" class="card" style="padding: 0.75rem;">
      <h2 style="margin: 0 0 0.5rem 0; font-size: 1.3rem;">{{ event.title }}</h2>
      <p style="margin: 0.5rem 0; font-size: 0.9rem; line-height: 1.4; white-space: pre-wrap;">{{ event.description }}</p>
      
      <div style="margin: 0.5rem 0;">
        <p style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>日時:</strong> {{ new Date(event.date).toLocaleString() }}</p>
        <p v-if="event.location" style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>場所:</strong> {{ event.location }}</p>
        <p style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>参加者数:</strong> {{ participantCount }}{{ event.maxParticipants ? ` / ${event.maxParticipants}` : '' }}人</p>
      </div>
      
      <div v-if="participantProfiles.length" style="margin: 0.3rem 0;">
        <strong style="font-size: 0.85rem;">参加者一覧:</strong>
        <div style="max-height: 120px; overflow-y: auto; margin-top: 0.2rem; border: 1px solid #ddd; border-radius: 4px; padding: 0.2rem;">
          <div v-for="profile in participantProfiles" :key="profile.id" 
               style="padding: 0.15rem 0.2rem; margin-bottom: 0.05rem; background: rgba(66, 133, 244, 0.03); border-radius: 3px; border-left: 1px solid #4285f4;">
            <div style="display: flex; align-items: center; gap: 0.3rem;">
              <strong style="color: #333; font-size: 0.8rem;">{{ profile.name || '名前未設定' }}</strong>
              <span v-if="profile.hobbyTags?.length" style="font-size: 0.7rem; color: #666;">
                <span v-for="(hobby, index) in profile.hobbyTags.slice(0, 10)" :key="index" 
                      style="background: #28a745; color: white; padding: 0.05rem 0.2rem; margin-right: 0.1rem; border-radius: 4px; font-size: 0.65rem;">
                  {{ hobby }}
                </span>
                <span v-if="profile.hobbyTags.length > 10" style="color: #999; font-size: 0.65rem;">+{{ profile.hobbyTags.length - 10 }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="event.tags?.length" style="margin: 0.5rem 0;">
        <strong style="font-size: 0.9rem;">タグ:</strong>
        <span v-for="(tag, index) in event.tags" :key="index" 
              style="background: #007bff; color: white; padding: 0.15rem 0.4rem; margin-left: 0.3rem; border-radius: 10px; font-size: 0.75rem;">
          {{ tag }}
        </span>
      </div>
      
      <div style="margin-top: 2rem; padding-bottom: 2rem;">
        <button v-if="!isParticipating && canJoin" 
                @click="joinEvent"
                style="padding: 0.5rem 1rem; font-size: 0.9rem; background: #4CAF50; border: none; border-radius: 6px; color: white; cursor: pointer;">
          参加する
        </button>
        
        <button v-if="isParticipating" 
                @click="leaveEvent"
                style="background: #dc3545; padding: 0.5rem 1rem; font-size: 0.9rem;">
          参加をキャンセル
        </button>
        
        <p v-if="!canJoin && !isParticipating" style="color: #dc3545; margin-top: 0.3rem; font-size: 0.85rem;">
          定員に達しています
        </p>
      </div>
    </div>
  </div>
</template>