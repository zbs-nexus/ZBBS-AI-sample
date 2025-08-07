<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

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

function joinEvent() {
  if (!props.eventId || !canJoin.value) return;
  
  client.models.EventParticipant.create({
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
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <button @click="emit('back')" style="margin-bottom: 1rem;">← 戻る</button>
    
    <div v-if="event" class="card">
      <h2 style="margin-top: 0;">{{ event.title }}</h2>
      <p style="margin: 1rem 0;">{{ event.description }}</p>
      
      <div style="margin: 1rem 0;">
        <p><strong>開催日時:</strong> {{ new Date(event.date).toLocaleString() }}</p>
        <p v-if="event.location"><strong>開催場所:</strong> {{ event.location }}</p>
        <p><strong>参加者数:</strong> {{ participantCount }}{{ event.maxParticipants ? ` / ${event.maxParticipants}` : '' }}人</p>
      </div>
      
      <div v-if="participantProfiles.length" style="margin: 1rem 0;">
        <strong>参加者一覧:</strong>
        <div style="max-height: 300px; overflow-y: auto; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 8px; padding: 0.5rem;">
          <div v-for="profile in participantProfiles" :key="profile.id" 
               style="display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0.5rem; margin-bottom: 0.125rem; background: rgba(66, 133, 244, 0.05); border-radius: 6px; border-left: 3px solid #4285f4;">
            <div>
              <strong style="color: #333;">{{ profile.name || '名前未設定' }}</strong>
            </div>
            <div>
              <span v-if="profile.hobbyTags?.length" style="font-size: 0.9rem; color: #666;">
                趣味: 
                <span v-for="(hobby, index) in profile.hobbyTags" :key="index" 
                      style="background: #28a745; color: white; padding: 0.2rem 0.4rem; margin-left: 0.25rem; border-radius: 8px; font-size: 0.8rem;">
                  {{ hobby }}
                </span>
              </span>
              <span v-else style="font-size: 0.9rem; color: #999;">趣味未設定</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="event.tags?.length" style="margin: 1rem 0;">
        <strong>タグ:</strong>
        <span v-for="(tag, index) in event.tags" :key="index" 
              style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-left: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
          {{ tag }}
        </span>
      </div>
      
      <div style="margin-top: 1.5rem; padding-bottom: 6rem;">
        <button v-if="!isParticipating && canJoin" 
                @click="joinEvent">
          参加する
        </button>
        
        <button v-if="isParticipating" 
                @click="leaveEvent"
                style="background: #dc3545;">
          参加をキャンセル
        </button>
        
        <p v-if="!canJoin && !isParticipating" style="color: #dc3545; margin-top: 0.5rem;">
          定員に達しています
        </p>
      </div>
    </div>
  </div>
</template>