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
const tagMaster = ref<Array<Schema['TagMaster']['type']>>([]);
const categories = ref<string[]>([]);
const selectedCategory = ref<string>('');
const selectedEditCategory = ref<string>('');
const searchTag = ref('');
const showCreateForm = ref(false);
const editingEventId = ref<string | null>(null);
let tagSubscription: any = null;
const newEvent = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  maxParticipants: 10,
  tags: [] as string[]
});
const editEvent = ref({
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

function loadTagMaster() {
  // 既存のsubscriptionをクリア
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
  
  tagSubscription = client.models.TagMaster.observeQuery({
    filter: { isActive: { eq: "true" } }
  }).subscribe({
    next: ({ items }) => {
      tagMaster.value = items.sort((a, b) => a.name.localeCompare(b.name));
      // カテゴリー一覧を取得
      const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
      categories.value = uniqueCategories.sort();
    }
  });
}

function getTagsByCategory(category: string) {
  return tagMaster.value.filter(tag => tag.category === category);
}

function createEvent() {
  if (!newEvent.value.title || !newEvent.value.date) {
    alert('イベント名と開催日時は必須です');
    return;
  }
  
  if (newEvent.value.tags.length === 0) {
    alert('タグを少なくとも1つ追加してください');
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
  // タグ選択用のダイアログを表示する代わりに、選択式UIを使用
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

function startEditEvent(event: Schema['Event']['type'], clickEvent: Event) {
  clickEvent.stopPropagation();
  editingEventId.value = event.id;
  editEvent.value = {
    title: event.title || '',
    description: event.description || '',
    date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    location: event.location || '',
    maxParticipants: event.maxParticipants || 10,
    tags: (event.tags || []).filter((tag): tag is string => tag !== null)
  };
}

function updateEvent() {
  if (!editEvent.value.title || !editEvent.value.date) {
    alert('イベント名と開催日時は必須です');
    return;
  }
  
  if (editEvent.value.tags.length === 0) {
    alert('タグを少なくとも1つ追加してください');
    return;
  }
  
  const eventData = {
    id: editingEventId.value!,
    title: editEvent.value.title,
    description: editEvent.value.description,
    date: new Date(editEvent.value.date).toISOString(),
    location: editEvent.value.location,
    maxParticipants: editEvent.value.maxParticipants,
    tags: editEvent.value.tags
  };
  
  client.models.Event.update(eventData).then((result) => {
    console.log('イベント更新成功:', result);
    editingEventId.value = null;
    editEvent.value = { title: '', description: '', date: '', location: '', maxParticipants: 10, tags: [] };
  }).catch((error) => {
    console.error('イベント更新エラー:', error);
    alert('イベント更新に失敗しました');
  });
}

function addEditTag() {
  // タグ選択用のダイアログを表示する代わりに、選択式UIを使用
}

function toggleTag(tagName: string, isEdit = false) {
  const targetTags = isEdit ? editEvent.value.tags : newEvent.value.tags;
  const index = targetTags.indexOf(tagName);
  if (index > -1) {
    targetTags.splice(index, 1);
  } else {
    targetTags.push(tagName);
  }
}

function cancelEdit() {
  editingEventId.value = null;
  editEvent.value = { title: '', description: '', date: '', location: '', maxParticipants: 10, tags: [] };
}



const filteredEvents = computed(() => {
  if (!searchTag.value) return events.value;
  return events.value.filter(event => 
    event.tags?.some(tag => tag && tag.includes(searchTag.value))
  );
});

import { onUnmounted } from 'vue';

onMounted(() => {
  loadEvents();
  loadTagMaster();
});

onUnmounted(() => {
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
});
</script>

<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <!-- 固定ヘッダー部分 -->
    <div style="padding: 1rem; border-bottom: 1px solid #ddd; background: white;">
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

      <div v-if="showCreateForm" class="card">
        <h3>新規イベント作成</h3>
        <div class="form-container">
          <div class="form-group">
            <label>イベント名 *</label>
            <input v-model="newEvent.title" placeholder="イベント名" required />
          </div>
          <div class="form-group">
            <label>説明</label>
            <textarea v-model="newEvent.description" placeholder="説明" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>開催日時 *</label>
            <input v-model="newEvent.date" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>開催場所</label>
            <input v-model="newEvent.location" placeholder="開催場所" />
          </div>
          <div class="form-group">
            <label>最大参加者数</label>
            <input v-model="newEvent.maxParticipants" type="number" placeholder="最大参加者数" />
          </div>
          <div class="form-group">
            <label>タグ *</label>
            <div style="margin-bottom: 0.5rem;">
              <select v-model="selectedCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px;">
                <option value="">カテゴリーを選択してください</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <div v-if="selectedCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
              <div v-for="tag in getTagsByCategory(selectedCategory)" :key="tag.id" style="margin-bottom: 0.5rem;">
                <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                  <input type="checkbox" 
                         :checked="newEvent.tags.includes(tag.name)" 
                         @change="toggleTag(tag.name)" 
                         style="margin-right: 0.5rem; width: auto;" />
                  <span>{{ tag.name }}</span>
                </label>
              </div>
            </div>
            <div v-if="newEvent.tags.length" style="margin-top: 0.5rem;">
              <span v-for="(tag, index) in newEvent.tags" :key="index" 
                    style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
                {{ tag }}
              </span>
            </div>
            <div v-else style="margin-top: 0.5rem; color: #666; font-size: 0.8rem;">
              タグを少なくとも1つ選択してください
            </div>
          </div>
          <div class="form-group">
            <button @click="createEvent" type="button">
              作成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- スクロール可能なイベント一覧部分 -->
    <div style="flex: 1; overflow-y: auto; padding: 1rem;">
      <div v-for="event in filteredEvents" :key="event.id" 
           style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; position: relative; background: white;"
           :style="{ cursor: editingEventId === event.id ? 'default' : 'pointer' }"
           @click="editingEventId !== event.id ? emit('showDetail', event.id) : null">
        
        <div v-if="isEventOwner(event)" style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem;">
          <button @click="startEditEvent(event, $event)"
                  style="background: #fd7e14; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem; cursor: pointer;">
            編集
          </button>
          <button @click="deleteEvent(event, $event)"
                  style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem; cursor: pointer;">
            削除
          </button>
        </div>
        
        <div v-if="editingEventId === event.id">
          <h3>イベント編集</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
            <input v-model="editEvent.title" placeholder="イベント名" required />
            <textarea v-model="editEvent.description" placeholder="説明" rows="3"></textarea>
            <input v-model="editEvent.date" type="datetime-local" required />
            <input v-model="editEvent.location" placeholder="開催場所" />
            <input v-model="editEvent.maxParticipants" type="number" placeholder="最大参加者数" />
            <div>
              <label><strong>タグ *</strong></label>
              <div style="margin-bottom: 0.5rem; margin-top: 0.5rem;">
                <select v-model="selectedEditCategory" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                  <option value="">カテゴリーを選択してください</option>
                  <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                </select>
              </div>
              <div v-if="selectedEditCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px; padding: 0.5rem; background: white;">
                <div v-for="tag in getTagsByCategory(selectedEditCategory)" :key="tag.id" style="margin-bottom: 0.5rem;">
                  <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                    <input type="checkbox" 
                           :checked="editEvent.tags.includes(tag.name)" 
                           @change="toggleTag(tag.name, true)" 
                           style="margin-right: 0.5rem;" />
                    <span>{{ tag.name }}</span>
                  </label>
                </div>
              </div>
              <div v-if="editEvent.tags.length" style="margin-top: 0.5rem;">
                <span v-for="(tag, index) in editEvent.tags" :key="index" 
                      style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
                  {{ tag }}
                </span>
              </div>
              <div v-else style="margin-top: 0.5rem; color: #666; font-size: 0.8rem;">
                タグを少なくとも1つ選択してください
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button @click="updateEvent" style="background: #28a745; color: white; padding: 0.5rem;">
                更新
              </button>
              <button @click="cancelEdit" style="background: #6c757d; color: white; padding: 0.5rem;">
                キャンセル
              </button>
            </div>
          </div>
        </div>
        
        <div v-else>
          <h3 style="font-size: 1.5rem; font-weight: 700;">{{ event.title }}</h3>
          <p><strong>開催日時:</strong> {{ new Date(event.date).toLocaleString() }}</p>
          <p v-if="event.location"><strong>開催場所:</strong> {{ event.location }}</p>
          <div v-if="event.tags?.length">
            <span v-for="(tag, index) in event.tags" :key="index" 
                  style="background: #007bff; color: white; padding: 0.2rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; font-size: 0.8rem;">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>