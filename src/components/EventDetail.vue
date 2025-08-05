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
    }
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
  <div style="padding: 1rem;">
    <button @click="emit('back')" style="margin-bottom: 1rem;">← 戻る</button>
    
    <div v-if="event" style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 4px; background: white;">
      <h2>{{ event.title }}</h2>
      <p style="margin: 1rem 0;">{{ event.description }}</p>
      
      <div style="margin: 1rem 0;">
        <p><strong>日時:</strong> {{ new Date(event.date).toLocaleString() }}</p>
        <p v-if="event.location"><strong>場所:</strong> {{ event.location }}</p>
        <p><strong>参加者数:</strong> {{ participantCount }}{{ event.maxParticipants ? ` / ${event.maxParticipants}` : '' }}人</p>
      </div>
      
      <div v-if="event.tags?.length" style="margin: 1rem 0;">
        <strong>タグ:</strong>
        <span v-for="(tag, index) in event.tags" :key="index" 
              style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-left: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
          {{ tag }}
        </span>
      </div>
      
      <div style="margin-top: 1.5rem;">
        <button v-if="!isParticipating && canJoin" 
                @click="joinEvent"
                style="background: #28a745; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;">
          参加する
        </button>
        
        <button v-if="isParticipating" 
                @click="leaveEvent"
                style="background: #dc3545; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;">
          参加をキャンセル
        </button>
        
        <p v-if="!canJoin && !isParticipating" style="color: #dc3545; margin-top: 0.5rem;">
          定員に達しています
        </p>
      </div>
    </div>
  </div>
</template>