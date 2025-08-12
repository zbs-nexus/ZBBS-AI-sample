<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { generateWikiId } from '../utils/idGenerator';

const client = generateClient<Schema>();

const props = defineProps<{
  clubId: string | null;
  user: any;
}>();

const emit = defineEmits<{
  back: [];
  showApplications: [clubId: string];
}>();

const club = ref<Schema['Club']['type'] | null>(null);
const wikiPage = ref<Schema['WikiPage']['type'] | null>(null);
const isEditing = ref(false);
const editForm = ref({
  title: '',
  content: ''
});
const hasApplied = ref(false);
const userProfile = ref<Schema['UserProfile']['type'] | null>(null);

const hasContent = computed(() => wikiPage.value && wikiPage.value.content);

function loadClub() {
  if (!props.clubId) return;
  
  client.models.Club.get({ id: props.clubId }).then(({ data }) => {
    club.value = data;
  });
}

function loadWikiPage() {
  if (!props.clubId) return;
  
  client.models.WikiPage.observeQuery({
    filter: { clubId: { eq: props.clubId } }
  }).subscribe({
    next: ({ items }) => {
      if (items.length > 0) {
        wikiPage.value = items[0];
        editForm.value = {
          title: wikiPage.value.title || '',
          content: wikiPage.value.content || ''
        };
      } else {
        wikiPage.value = null;
        editForm.value = {
          title: club.value?.name + ' Wiki' || 'Wiki',
          content: ''
        };
      }
    }
  });
}

function startEditing() {
  isEditing.value = true;
  if (wikiPage.value) {
    editForm.value = {
      title: wikiPage.value.title || '',
      content: wikiPage.value.content || ''
    };
  } else {
    editForm.value = {
      title: club.value?.name + ' Wiki' || 'Wiki',
      content: ''
    };
  }
}

async function saveWiki() {
  if (!editForm.value.title) {
    alert('タイトルは必須です');
    return;
  }
  
  try {
    const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
    
    if (wikiPage.value) {
      // 既存ページを更新
      await client.models.WikiPage.update({
        id: wikiPage.value.id,
        title: editForm.value.title,
        content: editForm.value.content,
        lastEditedBy: currentUser
      });
    } else {
      // 新規ページを作成
      const customId = await generateWikiId();
      await client.models.WikiPage.create({
        id: customId,
        clubId: props.clubId!,
        title: editForm.value.title,
        content: editForm.value.content,
        lastEditedBy: currentUser
      });
    }
    
    isEditing.value = false;
  } catch (error) {
    console.error('Wiki保存エラー:', error);
    alert('Wiki保存に失敗しました');
  }
}

function cancelEdit() {
  isEditing.value = false;
  if (wikiPage.value) {
    editForm.value = {
      title: wikiPage.value.title || '',
      content: wikiPage.value.content || ''
    };
  }
}

function loadUserProfile() {
  client.models.UserProfile.list({
    filter: { userId: { eq: props.user.userId } }
  }).then(({ data }) => {
    userProfile.value = data.length > 0 ? data[0] : null;
  });
}

function checkApplicationStatus() {
  if (!props.clubId) return;
  
  client.models.ClubApplication.list({
    filter: { 
      clubId: { eq: props.clubId },
      applicantUserId: { eq: props.user.userId }
    }
  }).then(({ data }) => {
    hasApplied.value = data.length > 0;
  });
}

async function applyToClub() {
  if (!userProfile.value || !userProfile.value.name || !userProfile.value.department || !userProfile.value.section) {
    alert('参加申請にはプロフィールの名前、部門、課/グループの設定が必要です');
    return;
  }
  
  try {
    await client.models.ClubApplication.create({
      clubId: props.clubId!,
      applicantUserId: props.user.userId,
      status: 'pending'
    });
    
    // メール通知送信
    if (club.value?.representativeEmail) {
      const { sendClubApplicationNotification } = await import('../utils/emailService');
      await sendClubApplicationNotification({
        representativeEmail: club.value.representativeEmail,
        applicantName: userProfile.value.name,
        applicantDepartment: userProfile.value.department,
        applicantSection: userProfile.value.section,
        clubName: club.value.name
      });
    }
    
    hasApplied.value = true;
    alert('参加申請を送信しました');
  } catch (error) {
    console.error('参加申請エラー:', error);
    alert('参加申請に失敗しました');
  }
}

function isClubRepresentative() {
  return club.value?.representativeEmail === props.user.userId;
}

function showApplicationsList() {
  emit('showApplications', props.clubId!);
}

onMounted(() => {
  loadClub();
  loadWikiPage();
  loadUserProfile();
  checkApplicationStatus();
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
      <button @click="emit('back')" 
              style="padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: bold;
                     background: #ffffff; color: #333333; border: 2px solid #333333; border-radius: 6px; 
                     cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
              @mouseover="($event.target as HTMLElement).style.background = '#f8f9fa'"
              @mouseout="($event.target as HTMLElement).style.background = '#ffffff'">
        ← 戻る
      </button>
      
      <h2 style="margin: 0; flex: 1;">{{ club?.name }} Wiki</h2>
      
      <button v-if="!isEditing" @click="startEditing" 
              style="padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: bold;
                     background: #ffffff; color: #333333; border: 2px solid #333333; border-radius: 6px; 
                     cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
              @mouseover="($event.target as HTMLElement).style.background = '#f8f9fa'"
              @mouseout="($event.target as HTMLElement).style.background = '#ffffff'">
        {{ hasContent ? '編集' : '作成' }}
      </button>
    </div>

    <div v-if="!isEditing" class="card">
      <div v-if="hasContent">
        <h1 style="margin: 0 0 1rem 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">
          {{ wikiPage?.title }}
        </h1>
        
        <div style="line-height: 1.6; white-space: pre-wrap; color: #444;">
          {{ wikiPage?.content }}
        </div>
        
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
          <span>最終更新: {{ wikiPage?.lastEditedBy }} ({{ new Date(wikiPage?.updatedAt || '').toLocaleString() }})</span>
          <div style="display: flex; gap: 0.5rem;">
            <button v-if="isClubRepresentative()" @click="showApplicationsList"
                    style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              申請者一覧
            </button>
            <button v-if="!hasApplied && !isClubRepresentative()" @click="applyToClub"
                    style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
              参加申請
            </button>
            <span v-if="hasApplied && !isClubRepresentative()" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #6c757d; color: white; border-radius: 4px;">
              申請済み
            </span>
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 3rem; color: #666;">
        <h3>まだWikiページが作成されていません</h3>
        <p>「作成」ボタンを押してWikiページを作成してください</p>
      </div>
    </div>

    <div v-else class="card">
      <h3>Wiki編集</h3>
      <div class="form-container">
        <div class="form-group">
          <label>タイトル *</label>
          <input v-model="editForm.title" placeholder="Wikiタイトル" required />
        </div>
        
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="editForm.content" 
                    placeholder="Wikiの内容を入力してください&#10;&#10;例:&#10;## 部活動について&#10;この部活動は...&#10;&#10;## 活動内容&#10;- 定期的な練習&#10;- イベント参加&#10;&#10;## 連絡先&#10;部長: 田中太郎"
                    rows="15"
                    style="font-family: 'Noto Sans JP', monospace; line-height: 1.5;"></textarea>
        </div>
        
        <div class="form-group">
          <div style="display: flex; gap: 1rem;">
            <button @click="saveWiki" type="button">保存</button>
            <button @click="cancelEdit" type="button" style="background: #6c757d;">キャンセル</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>