<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const props = defineProps<{
  user: any;
}>();

const emit = defineEmits<{
  back: [];
}>();

const profile = ref<Schema['UserProfile']['type'] | null>(null);
const tagMaster = ref<Array<Schema['TagMaster']['type']>>([]);
const isEditing = ref(false);
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
  client.models.TagMaster.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }) => {
      tagMaster.value = items.filter(item => item.category === 'hobby').sort((a, b) => a.name.localeCompare(b.name));
    }
  });
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
</script>

<template>
  <div style="padding: 1rem;">
    <button @click="emit('back')" style="margin-bottom: 1rem;">← 戻る</button>
    
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2>プロフィール</h2>
        <button v-if="!isEditing" @click="startEditing">編集</button>
      </div>
      
      <div v-if="!isEditing">
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
            <div style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
              <div v-for="tag in tagMaster" :key="tag.id" style="margin-bottom: 0.5rem;">
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
    </div>
  </div>
</template>