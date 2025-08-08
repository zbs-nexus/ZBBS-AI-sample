<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { generateUserProfileId } from '../utils/idGenerator';

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
const editForm = ref({
  name: '',
  department: '',
  section: '',
  hobbyTags: [] as string[],
  profileImageUrl: ''
});
const imagePreview = ref<string>('');

let tagSubscription: any = null;

function loadProfile() {
  console.log('プロフィール読み込み開始:', props.user.userId);
  client.models.UserProfile.observeQuery({
    filter: { userId: { eq: props.user.userId } }
  }).subscribe({
    next: ({ items }) => {
      console.log('プロフィールデータ:', items);
      if (items.length > 0) {
        profile.value = items[0];
        console.log('既存プロフィール:', profile.value);
        editForm.value = {
          name: profile.value.name || '',
          department: profile.value.department || '',
          section: profile.value.section || '',
          hobbyTags: (profile.value.hobbyTags || []).filter((tag): tag is string => tag !== null),
          profileImageUrl: profile.value.profileImageUrl || ''
        };
        imagePreview.value = profile.value.profileImageUrl || '';
      } else {
        console.log('プロフィールが見つかりません');
      }
    },
    error: (error) => {
      console.error('プロフィール読み込みエラー:', error);
    }
  });
}

async function saveProfile() {
  console.log('保存開始:', editForm.value);
  
  // 必須項目のチェック
  if (!editForm.value.name || !editForm.value.department || !editForm.value.section || editForm.value.hobbyTags.length === 0) {
    alert('すべての項目（名前、部、課、趣味タグ）を入力してください。');
    return;
  }
  
  if (profile.value) {
    console.log('既存プロフィール更新:', profile.value.id);
    client.models.UserProfile.update({
      id: profile.value.id,
      name: editForm.value.name || '名前未設定',
      department: editForm.value.department,
      section: editForm.value.section,
      hobbyTags: editForm.value.hobbyTags,
      profileImageUrl: editForm.value.profileImageUrl
    }).then((result) => {
      console.log('更新成功:', result);
      isEditing.value = false;
    }).catch((error) => {
      console.error('更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    });
  } else {
    console.log('新規プロフィール作成');
    const customId = await generateUserProfileId();
    client.models.UserProfile.create({
      id: customId,
      userId: props.user.userId,
      name: editForm.value.name || '名前未設定',
      department: editForm.value.department,
      section: editForm.value.section,
      hobbyTags: editForm.value.hobbyTags,
      profileImageUrl: editForm.value.profileImageUrl
    }).then((result) => {
      console.log('作成成功:', result);
      isEditing.value = false;
    }).catch((error) => {
      console.error('作成エラー:', error);
      alert('プロフィールの作成に失敗しました');
    });
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
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
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
  
  tagSubscription = client.models.TagMaster.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }) => {
      tagMaster.value = items.sort((a, b) => a.name.localeCompare(b.name));
      const allCategories = [...new Set(items.map(item => item.category))];
      categories.value = allCategories.sort();
    }
  });
}

function getHobbyTagsByCategory(category: string) {
  return tagMaster.value.filter(tag => tag.category === category);
}

function startEditing() {
  isEditing.value = true;
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      department: profile.value.department || '',
      section: profile.value.section || '',
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

onUnmounted(() => {
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <button @click="emit('back')" 
            style="margin-bottom: 1rem; padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: bold;
                   background: #ffffff; color: #333333; border: 2px solid #333333; border-radius: 6px; 
                   cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
            @mouseover="($event.target as HTMLElement).style.background = '#f8f9fa'"
            @mouseout="($event.target as HTMLElement).style.background = '#ffffff'">
      ← 戻る
    </button>
    
    <div class="card" style="position: relative;">
      <button v-if="!isEditing" @click="startEditing" 
              style="position: absolute; top: 1rem; right: 1rem; padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: bold;
                     background: #ffffff; color: #333333; border: 2px solid #333333; border-radius: 6px; 
                     cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
              @mouseover="($event.target as HTMLElement).style.background = '#f8f9fa'"
              @mouseout="($event.target as HTMLElement).style.background = '#ffffff'">
        編集
      </button>
      
      <div v-if="!isEditing" style="margin-top: 0;">
        <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
          <div v-if="profile?.profileImageUrl" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #667eea;">
            <img :src="profile.profileImageUrl" alt="プロフィール画像" style="width: 100%; height: 100%; object-fit: cover;" />
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
        
        <div>
          <div v-if="profile?.hobbyTags?.length" style="margin-top: 0.5rem;">
            <span v-for="(tag, index) in profile.hobbyTags" :key="index" 
                  style="background: #28a745; color: white; padding: 0.2rem 0.4rem; margin-right: 0.3rem; margin-bottom: 0.3rem; border-radius: 10px; font-size: 0.75rem; display: inline-block;">
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
            <label><strong>部:</strong></label>
            <input v-model="editForm.department" placeholder="部を入力" />
          </div>
          
          <div class="form-group">
            <label><strong>課/グループ:</strong></label>
            <input v-model="editForm.section" placeholder="課/グループを入力" />
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
                    @click="toggleHobbyTag(tag)"
                    style="background: #28a745; color: white; padding: 0.3rem 0.6rem; margin-right: 0.5rem; margin-bottom: 0.5rem; border-radius: 12px; font-size: 0.9rem; display: inline-block; cursor: pointer;">
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
      
      <button v-if="!isEditing" @click="props.signOut" 
              style="position: absolute; bottom: 1rem; right: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem; background: #dc3545; border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.3s ease;"
              @mouseover="($event.target as HTMLElement).style.background = '#c82333'"
              @mouseout="($event.target as HTMLElement).style.background = '#dc3545'">
        ログアウト
      </button>
    </div>
    <div style="padding-bottom: 4rem;"></div>
  </div>
</template>