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
const isEditing = ref(false);
const editForm = ref({
  name: '',
  bio: '',
  hobbyTags: [] as string[]
});

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
          hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null)
        };
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

function addHobbyTag() {
  const tag = prompt('趣味タグを入力してください');
  if (tag && !editForm.value.hobbyTags.includes(tag)) {
    editForm.value.hobbyTags.push(tag);
  }
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
      hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null)
    };
  }
}

onMounted(() => {
  loadProfile();
});
</script>

<template>
  <div style="padding: 1rem;">
    <button @click="emit('back')" style="margin-bottom: 1rem;">← 戻る</button>
    
    <div style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 4px; background: white;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2>プロフィール</h2>
        <button v-if="!isEditing" @click="startEditing">編集</button>
      </div>
      
      <div v-if="!isEditing">
        <div style="margin-bottom: 1rem;">
          <strong>名前:</strong> {{ profile?.name || '未設定' }}
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
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label><strong>名前:</strong></label>
            <input v-model="editForm.name" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #ccc; border-radius: 4px;" 
                   placeholder="名前を入力" />
          </div>
          
          <div>
            <label><strong>自己紹介:</strong></label>
            <textarea v-model="editForm.bio" 
                      rows="4" 
                      style="width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #ccc; border-radius: 4px;" 
                      placeholder="自己紹介を入力"></textarea>
          </div>
          
          <div>
            <label><strong>趣味タグ:</strong></label>
            <button @click="addHobbyTag" 
                    style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              タグ追加
            </button>
            <div v-if="editForm.hobbyTags.length" style="margin-top: 0.5rem;">
              <span v-for="(tag, index) in editForm.hobbyTags" :key="index" 
                    style="background: #28a745; color: white; padding: 0.3rem 0.6rem; margin-right: 0.5rem; margin-bottom: 0.5rem; border-radius: 12px; font-size: 0.9rem; display: inline-block; cursor: pointer;"
                    @click="removeHobbyTag(index)">
                {{ tag }} ×
              </span>
            </div>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button @click="saveProfile" 
                    style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
              保存
            </button>
            <button @click="isEditing = false" 
                    style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>