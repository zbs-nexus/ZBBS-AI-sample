<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const props = defineProps<{
  user: any;
}>();

const emit = defineEmits<{
  showDetail: [eventId: string];
}>();

const events = ref<Array<Schema['Event']['type']>>([]);
const searchTag = ref('');
const showCreateForm = ref(false);
const newEvent = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  maxParticipants: 10,
  tags: [] as string[]
});

function loadEvents() {
  client.models.Event.observeQuery().subscribe({
    next: ({ items }) => {
      console.log('イベントデータ取得:', items);
      events.value = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    error: (error) => {
      console.error('イベントデータ取得エラー:', error);
    }
  });
}

function createEvent() {
  if (!newEvent.value.title || !newEvent.value.date) {
    alert('イベント名と日時は必須です');
    return;
  }
  
  const eventData = {
    title: newEvent.value.title,
    description: newEvent.value.description,
    date: new Date(newEvent.value.date).toISOString(),
    location: newEvent.value.location,
    maxParticipants: newEvent.value.maxParticipants,
    tags: newEvent.value.tags,
    createdBy: props.user.username || props.user.userId || props.user.sub || 'anonymous'
  };
  
  client.models.Event.create(eventData).then((result) => {
    console.log('イベント作成成功:', result);
    showCreateForm.value = false;
    newEvent.value = { title: '', description: '', date: '', location: '', maxParticipants: 10, tags: [] };
  }).catch((error) => {
    console.error('イベント作成エラー:', error);
    alert('イベント作成に失敗しました');
  });
}

function addTag() {
  const tag = prompt('タグを入力してください');
  if (tag && tag.trim() && !newEvent.value.tags.includes(tag)) {
    newEvent.value.tags.push(tag);
  }
}

function deleteEvent(event: Schema['Event']['type'], clickEvent: Event) {
  clickEvent.stopPropagation();
  
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  if (event.createdBy !== currentUser) {
    alert('自分が作成したイベントのみ削除できます');
    return;
  }
  
  if (confirm(`「${event.title}」を削除しますか？`)) {
    client.models.Event.delete({ id: event.id }).then(() => {
      console.log('イベント削除成功');
    }).catch((error) => {
      console.error('イベント削除エラー:', error);
      alert('イベント削除に失敗しました');
    });
  }
}

function isEventOwner(event: Schema['Event']['type']) {
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  return event.createdBy === currentUser;
}



const filteredEvents = computed(() => {
  if (!searchTag.value) return events.value;
  return events.value.filter(event => 
    event.tags?.some(tag => tag && tag.includes(searchTag.value))
  );
});

onMounted(() => {
  loadEvents();
});
</script>

<template>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center;">
      <input 
        v-model="searchTag" 
        placeholder="タグで検索..." 
        style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
      />
      <button @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'キャンセル' : '新規イベント作成' }}
      </button>
    </div>

    <div v-if="showCreateForm" style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
      <h3>新規イベント作成</h3>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <input v-model="newEvent.title" placeholder="イベント名" required />
        <textarea v-model="newEvent.description" placeholder="説明" rows="3"></textarea>
        <input v-model="newEvent.date" type="datetime-local" required />
        <input v-model="newEvent.location" placeholder="場所" />
        <input v-model="newEvent.maxParticipants" type="number" placeholder="最大参加者数" />
        <div>
          <button @click="addTag">タグ追加</button>
          <div v-if="newEvent.tags.length" style="margin-top: 0.5rem;">
            <span v-for="(tag, index) in newEvent.tags" :key="index" 
                  style="background: #e0e0e0; padding: 0.2rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
              {{ tag }}
            </span>
          </div>
        </div>
        <button @click="createEvent" style="background: #007bff; color: white; padding: 0.5rem;">
          作成
        </button>
      </div>
    </div>

    <div v-for="event in filteredEvents" :key="event.id" 
         style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; cursor: pointer; position: relative;"
         @click="emit('showDetail', event.id)">
      <button v-if="isEventOwner(event)" 
              @click="deleteEvent(event, $event)"
              style="position: absolute; top: 0.5rem; right: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem; cursor: pointer;">
        削除
      </button>
      <h3>{{ event.title }}</h3>
      <p>{{ event.description }}</p>
      <p><strong>日時:</strong> {{ new Date(event.date).toLocaleString() }}</p>
      <p v-if="event.location"><strong>場所:</strong> {{ event.location }}</p>
      <div v-if="event.tags?.length">
        <span v-for="(tag, index) in event.tags" :key="index" 
              style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>