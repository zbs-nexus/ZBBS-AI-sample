<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AuthService, type UserProfile } from '../../services/authService';
import { EventService } from '../../services/eventService';
import { UIService } from '../../services/uiService';
import { uploadData, getUrl } from 'aws-amplify/storage';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
import BaseInput from '../shared/BaseInput.vue';
import BaseTag from '../shared/BaseTag.vue';

const props = defineProps<{
  user: any;
  signOut: () => void;
}>();

const emit = defineEmits<{
  back: [];
  showEventDetail: [eventId: string];
}>();

const profile = ref<UserProfile | null>(null);
const tagCategories = ref<Array<{ name: string; tags: string[] }>>([]);
const selectedHobbyCategory = ref<string>('');
const isEditing = ref(false);
const upcomingEvents = ref<any[]>([]);
const editForm = ref({
  name: '',
  department: '',
  section: '',
  hobbyTags: [] as string[],
  profileImageUrl: '',
  profileImageFile: null as File | null
});
const imagePreview = ref<string>('');
const displayImageUrl = ref<string>('');

async function loadProfile() {
  profile.value = await AuthService.getUserProfile(props.user.userId);
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      department: profile.value.department || '',
      section: profile.value.section || '',
      hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null && tag !== undefined),
      profileImageUrl: profile.value.profileImageUrl || '',
      profileImageFile: null
    };
    imagePreview.value = profile.value.profileImageUrl || '';
    await loadDisplayImage(profile.value.profileImageUrl || '');
  }
}

async function saveProfile() {
  if (!UIService.validateRequired(editForm.value.name) || 
      !UIService.validateRequired(editForm.value.department) || 
      !UIService.validateRequired(editForm.value.section) || 
      editForm.value.hobbyTags.length === 0) {
    UIService.showAlert('すべての項目（名前、部、課、趣味タグ）を入力してください。');
    return;
  }
  
  let imageUrl = editForm.value.profileImageUrl;
  
  if (editForm.value.profileImageFile) {
    try {
      const fileName = `profile-images/${props.user.userId}-${Date.now()}.${editForm.value.profileImageFile.name.split('.').pop()}`;
      await uploadData({
        key: fileName,
        data: editForm.value.profileImageFile,
        options: {
          contentType: editForm.value.profileImageFile.type
        }
      }).result;
      
      imageUrl = fileName;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      UIService.showAlert('画像のアップロードに失敗しました');
      return;
    }
  }
  
  const profileData: UserProfile = {
    id: profile.value?.id,
    userId: props.user.userId,
    name: editForm.value.name,
    department: editForm.value.department,
    section: editForm.value.section,
    hobbyTags: editForm.value.hobbyTags,
    profileImageUrl: imageUrl
  };
  
  const success = profile.value 
    ? await AuthService.updateUserProfile(profileData)
    : await AuthService.createUserProfile(profileData);
  
  if (success) {
    isEditing.value = false;
    await loadProfile();
  } else {
    UIService.showAlert('プロフィールの保存に失敗しました');
  }
}

async function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    editForm.value.profileImageFile = file;
  }
}

function toggleHobbyTag(tagName: string) {
  const index = editForm.value.hobbyTags.indexOf(tagName);
  if (index > -1) {
    editForm.value.hobbyTags.splice(index, 1);
  } else {
    if (editForm.value.hobbyTags.length >= 10) {
      UIService.showAlert('趣味タグは最大10個まで選択できます');
      return;
    }
    editForm.value.hobbyTags.push(tagName);
  }
}

async function loadTagCategories() {
  tagCategories.value = await UIService.getTagsByCategory();
}

function getHobbyTagsByCategory(category: string) {
  const categoryData = tagCategories.value.find(c => c.name === category);
  return categoryData ? categoryData.tags : [];
}

async function loadDisplayImage(imageKey: string) {
  if (!imageKey) {
    displayImageUrl.value = '';
    return;
  }
  
  try {
    const result = await getUrl({ key: imageKey });
    displayImageUrl.value = result.url.toString();
  } catch (error) {
    console.error('画像URL取得エラー:', error);
    displayImageUrl.value = '';
  }
}

function startEditing() {
  isEditing.value = true;
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      department: profile.value.department || '',
      section: profile.value.section || '',
      hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null && tag !== undefined),
      profileImageUrl: profile.value.profileImageUrl || '',
      profileImageFile: null
    };
    imagePreview.value = displayImageUrl.value;
  }
}

async function loadUpcomingEvents() {
  upcomingEvents.value = await EventService.getUserEvents(props.user.userId);
  const now = new Date();
  upcomingEvents.value = upcomingEvents.value
    .filter(event => {
      const eventEndTime = event.endDate ? new Date(event.endDate) : new Date(event.date);
      return eventEndTime > now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

onMounted(() => {
  loadProfile();
  loadTagCategories();
  loadUpcomingEvents();
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <BaseButton variant="primary" size="small" @click="emit('back')" style="margin-bottom: 1rem;">
      ← 戻る
    </BaseButton>
    
    <BaseCard style="position: relative;">
      <BaseButton v-if="!isEditing" variant="primary" size="small" @click="startEditing" 
                  style="position: absolute; top: 1rem; right: 1rem;">
        編集
      </BaseButton>
      
      <div v-if="!isEditing" style="margin-top: 0;">
        <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
          <div v-if="displayImageUrl" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #667eea;">
            <img :src="displayImageUrl" alt="プロフィール画像" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div v-else style="width: 80px; height: 80px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 3px solid #667eea;">
            <span style="color: #666; font-size: 0.8rem;">画像なし</span>
          </div>
          <div style="font-size: 1.2rem; font-weight: bold;">
            {{ profile?.name || '未設定' }}
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <p style="margin-top: 0.5rem;">
            <span v-if="profile?.department || profile?.section">
              {{ profile?.department || '未設定' }} / {{ profile?.section || '未設定' }}
            </span>
            <span v-else>未設定</span>
          </p>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong style="font-size: 0.9rem; color: #333;">参加予定イベント:</strong>
          <div v-if="upcomingEvents.length" style="margin-top: 0.5rem;">
            <div v-for="event in upcomingEvents" :key="event.id" 
                 @click="emit('showEventDetail', event.id)"
                 style="background: #e3f2fd; color: #1976d2; padding: 0.3rem 0.6rem; margin-right: 0.3rem; margin-bottom: 0.3rem; border-radius: 8px; font-size: 0.8rem; display: inline-block; border-left: 3px solid #1976d2; cursor: pointer; transition: background-color 0.2s ease;"
                 @mouseover="($event.currentTarget as HTMLElement).style.backgroundColor = '#bbdefb'"
                 @mouseout="($event.currentTarget as HTMLElement).style.backgroundColor = '#e3f2fd'">
              <div style="font-weight: bold;">{{ event.title }}</div>
              <div style="font-size: 0.7rem; opacity: 0.8;">{{ UIService.formatDate(event.date) }}</div>
            </div>
          </div>
          <p v-else style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">参加予定のイベントはありません</p>
        </div>
        
        <div>
          <strong style="font-size: 0.9rem; color: #333;">趣味タグ:</strong>
          <div v-if="profile?.hobbyTags?.length" style="margin-top: 0.5rem;">
            <BaseTag v-for="(tag, index) in profile.hobbyTags" :key="index" 
                     :text="tag" variant="success" size="small" 
                     style="margin-right: 0.3rem; margin-bottom: 0.3rem;" />
          </div>
          <p v-else style="margin-top: 0.5rem; color: #666;">未設定</p>
        </div>
      </div>
      
      <div v-else>
        <div class="form-container">
          <div class="form-group">
            <label><strong>プロフィール画像:</strong></label>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
              <div v-if="imagePreview" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #667eea;">
                <img :src="imagePreview" alt="プレビュー" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div v-else style="width: 80px; height: 80px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 3px solid #667eea;">
                <span style="color: #666; font-size: 0.8rem;">画像なし</span>
              </div>
              <input type="file" accept="image/*" @change="handleImageSelect" style="flex: 1;" />
            </div>
          </div>
          
          <BaseInput v-model="editForm.name" label="名前" placeholder="名前を入力" required />
          <BaseInput v-model="editForm.department" label="部" placeholder="部を入力" required />
          <BaseInput v-model="editForm.section" label="課/グループ" placeholder="課/グループを入力" required />
          
          <div class="form-group">
            <label><strong>趣味タグ: (最大10個)</strong></label>
            <div style="margin-bottom: 0.5rem;">
              <select v-model="selectedHobbyCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px;">
                <option value="">カテゴリーを選択してください</option>
                <option v-for="category in tagCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
              </select>
            </div>
            <div v-if="selectedHobbyCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
              <div v-for="tag in getHobbyTagsByCategory(selectedHobbyCategory)" :key="tag" style="margin-bottom: 0.5rem;">
                <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                  <input type="checkbox" 
                         :checked="editForm.hobbyTags.includes(tag)" 
                         @change="toggleHobbyTag(tag)" 
                         style="margin-right: 0.5rem; width: auto;" />
                  <span>{{ tag }}</span>
                </label>
              </div>
            </div>
            <div v-if="editForm.hobbyTags.length" style="margin-top: 0.5rem;">
              <BaseTag v-for="(tag, index) in editForm.hobbyTags" :key="index" 
                       :text="tag" variant="success" size="small" removable
                       @remove="toggleHobbyTag(tag)"
                       style="margin-right: 0.5rem; margin-bottom: 0.5rem;" />
            </div>
          </div>
          
          <div class="form-group">
            <div style="display: flex; gap: 1rem;">
              <BaseButton variant="success" @click="saveProfile">保存</BaseButton>
              <BaseButton variant="secondary" @click="isEditing = false">キャンセル</BaseButton>
            </div>
          </div>
        </div>
      </div>
      
      <BaseButton v-if="!isEditing" variant="danger" @click="props.signOut" 
                  style="position: absolute; bottom: 1rem; right: 1rem;">
        ログアウト
      </BaseButton>
    </BaseCard>
    <div style="padding-bottom: 4rem;"></div>
  </div>
</template>