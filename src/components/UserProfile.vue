<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const props = defineProps<{
  user: any;
  signOut: () => void;
}>();

const emit = defineEmits<{
  back: [];
}>();

const profile = ref<Schema['UserProfile']['type'] | null>(null);
const tagMaster = ref<Array<Schema['TagMaster']['type']>>([]);
const categories = ref<string[]>([]);
const selectedHobbyCategory = ref<string>('');
const isEditing = ref(false);
let tagSubscription: any = null;
const editForm = ref({
  name: '',
  bio: '',
  hobbyTags: [] as string[],
  profileImageUrl: ''
});
const selectedFile = ref<File | null>(null);
const imagePreview = ref<string>('');

function loadProfile() {
  client.models.UserProfile.observeQuery({
    filter: { userId: { eq: props.user.userId } }
  }).subscribe({
    next: ({ items }) => {
      if (items.length > 0) {
        profile.value = items[0];
        editForm.value = {
          name: profile.value.name || '',
          bio: profile.value.bio || '',
          hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null),
          profileImageUrl: profile.value.profileImageUrl || ''
        };
        imagePreview.value = profile.value.profileImageUrl || '';
      }
    }
  });
}

function saveProfile() {
  if (profile.value) {
    client.models.UserProfile.update({
      id: profile.value.id,
      ...editForm.value
    }).then(() => {
      isEditing.value = false;
    });
  } else {
    client.models.UserProfile.create({
      userId: props.user.userId,
      ...editForm.value
    }).then(() => {
      isEditing.value = false;
    });
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
      editForm.value.profileImageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function toggleHobbyTag(tagName: string) {
  const index = editForm.value.hobbyTags.indexOf(tagName);
  if (index > -1) {
    editForm.value.hobbyTags.splice(index, 1);
  } else {
    editForm.value.hobbyTags.push(tagName);
  }
}

function loadTagMaster() {
  // 既存のsubscriptionをクリア
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
  
  tagSubscription = client.models.TagMaster.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }) => {
      console.log('取得したタグデータ:', items);
      tagMaster.value = items.sort((a, b) => a.name.localeCompare(b.name));
      // すべてのカテゴリーを表示
      const allCategories = [...new Set(items.map(item => item.category))];
      console.log('すべてのカテゴリー:', allCategories);
      categories.value = allCategories.sort();
      console.log('プロフィール用カテゴリー:', categories.value);
    }
  });
}

function getHobbyTagsByCategory(category: string) {
  return tagMaster.value.filter(tag => tag.category === category);
}

function removeHobbyTag(index: number) {
  editForm.value.hobbyTags.splice(index, 1);
}

function startEditing() {
  isEditing.value = true;
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      bio: profile.value.bio || '',
      hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null),
      profileImageUrl: profile.value.profileImageUrl || ''
    };
    imagePreview.value = profile.value.profileImageUrl || '';
  }
}

onMounted(() => {
  loadProfile();
  loadTagMaster();
});

// コンポーネントがアンマウントされる時にsubscriptionをクリア
import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <button @click="emit('back')" style="margin-bottom: 1rem;">← 戻る</button>
    
    <div class="card" style="position: relative;">
      <button v-if="!isEditing" @click="startEditing" style="position: absolute; top: 1rem; right: 1rem;">編集</button>
      
      <div v-if="!isEditing" style="margin-top: 0;">
        <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
          <div v-if="profile?.profileImageUrl" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #667eea;">
            <img :src="profile.profileImageUrl" alt="プロフィール画像" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div v-else style="width: 80px; height: 80px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 3px solid #667eea;">
            <span style="color: #666; font-size: 0.8rem;">画像なし</span>
          </div>
          <div>
            <strong>名前:</strong> {{ profile?.name || '未設定' }}
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>自己紹介:</strong>
          <p style="margin-top: 0.5rem;">{{ profile?.bio || '未設定' }}</p>
        </div>
        
        <div>
          <strong>趣味タグ:</strong>
          <div v-if="profile?.hobbyTags?.length" style="margin-top: 0.5rem;">
            <span v-for="(tag, index) in profile.hobbyTags" :key="index" 
                  style="background: #28a745; color: white; padding: 0.3rem 0.6rem; margin-right: 0.5rem; margin-bottom: 0.5rem; border-radius: 12px; font-size: 0.9rem; display: inline-block;">
              {{ tag }}
            </span>
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
          
          <div class="form-group">
            <label><strong>名前:</strong></label>
            <input v-model="editForm.name" placeholder="名前を入力" />
          </div>
          
          <div class="form-group">
            <label><strong>自己紹介:</strong></label>
            <textarea v-model="editForm.bio" rows="4" placeholder="自己紹介を入力"></textarea>
          </div>
          
          <div class="form-group">
            <label><strong>趣味タグ:</strong></label>
            <div style="margin-bottom: 0.5rem;">
              <select v-model="selectedHobbyCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px;">
                <option value="">カテゴリーを選択してください</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <div v-if="selectedHobbyCategory" style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
              <div v-for="tag in getHobbyTagsByCategory(selectedHobbyCategory)" :key="tag.id" style="margin-bottom: 0.5rem;">
                <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                  <input type="checkbox" 
                         :checked="editForm.hobbyTags.includes(tag.name)" 
                         @change="toggleHobbyTag(tag.name)" 
                         style="margin-right: 0.5rem; width: auto;" />
                  <span>{{ tag.name }}</span>
                </label>
              </div>
            </div>
            <div v-if="editForm.hobbyTags.length" style="margin-top: 0.5rem;">
              <span v-for="(tag, index) in editForm.hobbyTags" :key="index" 
                    style="background: #28a745; color: white; padding: 0.3rem 0.6rem; margin-right: 0.5rem; margin-bottom: 0.5rem; border-radius: 12px; font-size: 0.9rem; display: inline-block;">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <div style="display: flex; gap: 1rem;">
              <button @click="saveProfile" type="button">保存</button>
              <button @click="isEditing = false" type="button" style="background: #6c757d;">キャンセル</button>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="props.signOut" 
              style="position: absolute; bottom: 1rem; right: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem; background: #dc3545; border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.3s ease;"
              @mouseover="($event.target as HTMLElement).style.background = '#c82333'"
              @mouseout="($event.target as HTMLElement).style.background = '#dc3545'">
        ログアウト
      </button>
    </div>
    <div style="padding-bottom: 4rem;"></div>
  </div>
</template>