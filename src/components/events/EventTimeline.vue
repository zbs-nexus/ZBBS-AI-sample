<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { EventService, type Event } from '../../services/eventService';
import { UIService } from '../../services/uiService';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
import BaseInput from '../shared/BaseInput.vue';
import BaseTag from '../shared/BaseTag.vue';
import BaseModal from '../shared/BaseModal.vue';

const props = defineProps<{
  user: any;
}>();

const emit = defineEmits<{
  showDetail: [eventId: string];
}>();

const events = ref<Event[]>([]);
const tagCategories = ref<Array<{ name: string; tags: string[] }>>([]);
const clubs = ref<any[]>([]);
const selectedCategory = ref<string>('');
const selectedEditCategory = ref<string>('');
const searchTag = ref('');
const showCreateModal = ref(false);
const editingEventId = ref<string | null>(null);

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  endDate: '',
  location: '',
  maxParticipants: 10,
  tags: [] as string[],
  targetAudience: '',
  recruitmentDeadline: '',
  representativeEmail: ''
});

const editEvent = ref({
  title: '',
  description: '',
  date: '',
  endDate: '',
  location: '',
  maxParticipants: 10,
  tags: [] as string[],
  targetAudience: '',
  recruitmentDeadline: '',
  representativeEmail: ''
});

async function loadEvents() {
  events.value = await EventService.getEvents();
  events.value.sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
}

async function loadTagCategories() {
  tagCategories.value = await UIService.getTagsByCategory();
}

function getTagsByCategory(category: string) {
  const categoryData = tagCategories.value.find(c => c.name === category);
  return categoryData ? categoryData.tags : [];
}

async function createEvent() {
  if (!UIService.validateRequired(newEvent.value.title) || 
      !UIService.validateRequired(newEvent.value.date) || 
      !UIService.validateRequired(newEvent.value.endDate) || 
      !UIService.validateRequired(newEvent.value.location) || 
      !UIService.validateRequired(newEvent.value.recruitmentDeadline)) {
    UIService.showAlert('イベント名、開催日時、終了日時、開催場所、募集期限は必須です');
    return;
  }
  
  if (newEvent.value.endDate && new Date(newEvent.value.endDate) <= new Date(newEvent.value.date)) {
    UIService.showAlert('終了日時は開催日時より後の日時で設定してください');
    return;
  }
  
  if (newEvent.value.recruitmentDeadline && new Date(newEvent.value.recruitmentDeadline) >= new Date(newEvent.value.date)) {
    UIService.showAlert('募集期限は開催日時より前の日時で設定してください');
    return;
  }
  
  if (newEvent.value.tags.length === 0) {
    UIService.showAlert('タグを少なくとも1つ追加してください');
    return;
  }
  
  const eventData: Omit<Event, 'id'> = {
    title: newEvent.value.title,
    description: newEvent.value.description,
    date: new Date(newEvent.value.date).toISOString(),
    endDate: newEvent.value.endDate ? new Date(newEvent.value.endDate).toISOString() : null,
    location: newEvent.value.location,
    maxParticipants: newEvent.value.maxParticipants,
    tags: newEvent.value.tags,
    targetAudience: newEvent.value.targetAudience,
    recruitmentDeadline: newEvent.value.recruitmentDeadline ? new Date(newEvent.value.recruitmentDeadline).toISOString() : null,
    representativeEmail: newEvent.value.representativeEmail,
    createdBy: (props.user.username || props.user.userId || props.user.sub || 'anonymous') as string
  };
  
  const success = await EventService.createEvent(eventData);
  if (success) {
    showCreateModal.value = false;
    resetNewEvent();
    await loadEvents();
  } else {
    UIService.showAlert('イベント作成に失敗しました');
  }
}

async function deleteEvent(event: Event, clickEvent: any) {
  clickEvent.stopPropagation();
  
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  if (event.createdBy !== currentUser) {
    UIService.showAlert('自分が作成したイベントのみ削除できます');
    return;
  }
  
  if (UIService.showConfirm(`「${event.title}」を削除しますか？`)) {
    const success = await EventService.deleteEvent(event.id!);
    if (success) {
      await loadEvents();
    } else {
      UIService.showAlert('イベント削除に失敗しました');
    }
  }
}

function isEventOwner(event: Event) {
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  return event.createdBy === currentUser;
}

function startEditEvent(event: Event, clickEvent: any) {
  clickEvent.stopPropagation();
  editingEventId.value = event.id!;
  editEvent.value = {
    title: event.title || '',
    description: event.description || '',
    date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    location: event.location || '',
    maxParticipants: event.maxParticipants || 10,
    tags: (event.tags || []).filter((tag): tag is string => tag !== null && tag !== undefined),
    targetAudience: event.targetAudience || '',
    recruitmentDeadline: event.recruitmentDeadline ? new Date(event.recruitmentDeadline).toISOString().slice(0, 16) : ''
  };
}

async function updateEvent() {
  if (!UIService.validateRequired(editEvent.value.title) || 
      !UIService.validateRequired(editEvent.value.date) || 
      !UIService.validateRequired(editEvent.value.endDate) || 
      !UIService.validateRequired(editEvent.value.location) || 
      !UIService.validateRequired(editEvent.value.recruitmentDeadline)) {
    UIService.showAlert('イベント名、開催日時、終了日時、開催場所、募集期限は必須です');
    return;
  }
  
  if (editEvent.value.tags.length === 0) {
    UIService.showAlert('タグを少なくとも1つ追加してください');
    return;
  }
  
  const eventData: Event = {
    id: editingEventId.value!,
    title: editEvent.value.title,
    description: editEvent.value.description,
    date: new Date(editEvent.value.date).toISOString(),
    endDate: editEvent.value.endDate ? new Date(editEvent.value.endDate).toISOString() : null,
    location: editEvent.value.location,
    maxParticipants: editEvent.value.maxParticipants,
    tags: editEvent.value.tags,
    targetAudience: editEvent.value.targetAudience,
    recruitmentDeadline: editEvent.value.recruitmentDeadline ? new Date(editEvent.value.recruitmentDeadline).toISOString() : null,
    createdBy: (props.user.username || props.user.userId || props.user.sub || 'anonymous') as string
  };
  
  const success = await EventService.updateEvent(eventData);
  if (success) {
    cancelEdit();
    await loadEvents();
  } else {
    UIService.showAlert('イベント更新に失敗しました');
  }
}

function toggleTag(tagName: string, isEdit = false) {
  const targetTags = isEdit ? editEvent.value.tags : newEvent.value.tags;
  const index = targetTags.indexOf(tagName);
  if (index > -1) {
    targetTags.splice(index, 1);
  } else {
    if (targetTags.length >= 5) {
      UIService.showAlert('タグは最大5個まで選択できます');
      return;
    }
    targetTags.push(tagName);
  }
}

function cancelEdit() {
  editingEventId.value = null;
  resetEditEvent();
}

function resetNewEvent() {
  newEvent.value = { 
    title: '', description: '', date: '', endDate: '', location: '', 
    maxParticipants: 10, tags: [], targetAudience: '', recruitmentDeadline: '', representativeEmail: '' 
  };
}

function resetEditEvent() {
  editEvent.value = { 
    title: '', description: '', date: '', endDate: '', location: '', 
    maxParticipants: 10, tags: [], targetAudience: '', recruitmentDeadline: '' 
  };
}

const filteredEvents = computed(() => {
  if (!searchTag.value) return events.value;
  return events.value.filter(event => 
    event.tags?.some(tag => tag && tag.includes(searchTag.value))
  );
});

function isRecruitmentExpired(event: Event) {
  if (!event.recruitmentDeadline) return false;
  return new Date(event.recruitmentDeadline) < new Date();
}

onMounted(() => {
  loadEvents();
  loadTagCategories();
});
</script>

<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <!-- 固定ヘッダー部分 -->
    <div style="padding: 0.3rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: transparent;">
      <div style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
        <BaseInput v-model="searchTag" placeholder="タグ検索" 
                   style="flex: 1; max-width: 200px;" />
        
        <div style="flex: 1;"></div>
        
        <BaseButton variant="warning" @click="showCreateModal = true">
          イベント新規作成
        </BaseButton>
      </div>
    </div>

    <!-- スクロール可能なイベント一覧部分 -->
    <div style="flex: 1; overflow-y: auto; padding: 0.3rem 0.5rem 2rem 0.5rem;">
      <BaseCard v-for="event in filteredEvents" :key="event.id" 
                v-show="!editingEventId || editingEventId === event.id"
                :style="{ 
                  cursor: editingEventId === event.id ? 'default' : 'pointer',
                  background: isRecruitmentExpired(event) ? '#f5f5f5' : 'white',
                  opacity: isRecruitmentExpired(event) ? 0.6 : 1,
                  position: 'relative',
                  marginBottom: '0.5rem'
                }"
                @click="editingEventId !== event.id ? emit('showDetail', event.id!) : null">
        
        <div v-if="isEventOwner(event) && editingEventId !== event.id" 
             style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem;">
          <BaseButton variant="success" size="small" @click="startEditEvent(event, $event)">
            編集
          </BaseButton>
          <BaseButton variant="danger" size="small" @click="deleteEvent(event, $event)">
            削除
          </BaseButton>
        </div>
        
        <div v-if="editingEventId === event.id">
          <h3>イベント編集</h3>
          <div class="form-container" style="margin-top: 1rem;">
            <BaseInput v-model="editEvent.title" label="イベント名" required />
            <BaseInput v-model="editEvent.description" label="説明" type="textarea" :rows="3" />
            <BaseInput v-model="editEvent.date" label="開催日時" type="datetime-local" required />
            <BaseInput v-model="editEvent.endDate" label="終了日時" type="datetime-local" required />
            <BaseInput v-model="editEvent.location" label="開催場所" required />
            <BaseInput :model-value="editEvent.maxParticipants.toString()" @update:model-value="editEvent.maxParticipants = parseInt($event) || 10" label="最大参加者数" type="number" />
            <BaseInput v-model="editEvent.recruitmentDeadline" label="募集期限" type="datetime-local" required />
            
            <div class="form-group">
              <label><strong>タグ * (最大5個)</strong></label>
              <select v-model="selectedEditCategory" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 0.5rem;">
                <option value="">カテゴリーを選択してください</option>
                <option v-for="category in tagCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
              </select>
              <div v-if="selectedEditCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px; padding: 0.5rem; background: white; margin-bottom: 0.5rem;">
                <div v-for="tag in getTagsByCategory(selectedEditCategory)" :key="tag" style="margin-bottom: 0.5rem;">
                  <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                    <input type="checkbox" 
                           :checked="editEvent.tags.includes(tag)" 
                           @change="toggleTag(tag, true)" 
                           style="margin-right: 0.5rem;" />
                    <span>{{ tag }}</span>
                  </label>
                </div>
              </div>
              <div v-if="editEvent.tags.length" style="margin-top: 0.5rem;">
                <BaseTag v-for="(tag, index) in editEvent.tags" :key="index" 
                         :text="tag" variant="info" size="small" removable
                         @remove="toggleTag(tag, true)"
                         style="margin-right: 0.5rem; margin-bottom: 0.5rem;" />
              </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <BaseButton variant="success" @click="updateEvent">更新</BaseButton>
              <BaseButton variant="secondary" @click="cancelEdit">キャンセル</BaseButton>
            </div>
          </div>
        </div>
        
        <div v-else>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin: 0 0 0.3rem 0;">{{ event.title }}</h3>
          <p style="margin: 0.2rem 0; font-size: 0.9rem;"><strong>開催日時:</strong> {{ UIService.formatDate(event.date) }}</p>
          <p v-if="event.location" style="margin: 0.2rem 0; font-size: 0.9rem;"><strong>開催場所:</strong> {{ event.location }}</p>
          <p v-if="event.targetAudience" style="margin: 0.2rem 0; font-size: 0.9rem;"><strong>参加対象:</strong> {{ event.targetAudience }}</p>
          <div v-if="event.tags?.length" style="margin-top: 0.3rem;">
            <BaseTag v-for="(tag, index) in event.tags" :key="index" 
                     :text="tag" variant="info" size="small"
                     style="margin-right: 0.3rem; margin-bottom: 0.3rem;" />
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 新規作成モーダル -->
    <BaseModal v-model:show="showCreateModal" title="新規イベント作成" size="large">
      <div class="form-container">
        <BaseInput v-model="newEvent.title" label="イベント名" required />
        <BaseInput v-model="newEvent.description" label="説明" type="textarea" :rows="3" />
        <BaseInput v-model="newEvent.date" label="開催日時" type="datetime-local" required />
        <BaseInput v-model="newEvent.endDate" label="終了日時" type="datetime-local" required />
        <BaseInput v-model="newEvent.location" label="開催場所" required />
        <BaseInput :model-value="newEvent.maxParticipants.toString()" @update:model-value="newEvent.maxParticipants = parseInt($event) || 10" label="最大参加者数" type="number" />
        <BaseInput v-model="newEvent.representativeEmail" label="代表者メールアドレス" type="email" />
        <BaseInput v-model="newEvent.recruitmentDeadline" label="募集期限" type="datetime-local" required />
        
        <div class="form-group">
          <label><strong>タグ * (最大5個)</strong></label>
          <select v-model="selectedCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; margin-bottom: 0.5rem;">
            <option value="">カテゴリーを選択してください</option>
            <option v-for="category in tagCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
          </select>
          <div v-if="selectedCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9); margin-bottom: 0.5rem;">
            <div v-for="tag in getTagsByCategory(selectedCategory)" :key="tag" style="margin-bottom: 0.5rem;">
              <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                <input type="checkbox" 
                       :checked="newEvent.tags.includes(tag)" 
                       @change="toggleTag(tag)" 
                       style="margin-right: 0.5rem; width: auto;" />
                <span>{{ tag }}</span>
              </label>
            </div>
          </div>
          <div v-if="newEvent.tags.length" style="margin-top: 0.5rem;">
            <BaseTag v-for="(tag, index) in newEvent.tags" :key="index" 
                     :text="tag" variant="info" size="small" removable
                     @remove="toggleTag(tag)"
                     style="margin-right: 0.5rem; margin-bottom: 0.5rem;" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <BaseButton variant="success" @click="createEvent">作成</BaseButton>
        <BaseButton variant="secondary" @click="showCreateModal = false">キャンセル</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>