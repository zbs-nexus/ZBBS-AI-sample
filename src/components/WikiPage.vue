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
const applicationStatus = ref<string>('');
const userProfile = ref<Schema['UserProfile']['type'] | null>(null);
const approvedParticipants = ref<Array<{
  name: string;
  department: string;
  section: string;
  hobbyTags: string[];
}>>([]);

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
      if (!props.clubId) return;
      
      const customId = await generateWikiId();
      await client.models.WikiPage.create({
        id: customId,
        clubId: props.clubId,
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
    if (data.length > 0) {
      hasApplied.value = true;
      applicationStatus.value = data[0].status || 'pending';
    } else {
      hasApplied.value = false;
      applicationStatus.value = '';
    }
  });
}

async function loadApprovedParticipants() {
  if (!props.clubId) return;
  
  try {
    const { data: applications } = await client.models.ClubApplication.list({
      filter: { 
        clubId: { eq: props.clubId },
        status: { eq: 'approved' }
      }
    });

    const participantData = [];
    for (const app of applications) {
      const { data: profiles } = await client.models.UserProfile.list({
        filter: { userId: { eq: app.applicantUserId } }
      });
      
      if (profiles.length > 0) {
        const profile = profiles[0];
        participantData.push({
          name: profile.name || '名前未設定',
          department: profile.department || '部門未設定',
          section: profile.section || '課未設定',
          hobbyTags: (profile.hobbyTags || []).filter((tag): tag is string => tag !== null)
        });
      }
    }
    
    approvedParticipants.value = participantData;
  } catch (error) {
    console.error('参加者一覧取得エラー:', error);
  }
}

async function applyToClub() {
  if (!userProfile.value || !userProfile.value.name || !userProfile.value.department || !userProfile.value.section) {
    alert('参加申請にはプロフィールの名前、部門、課/グループの設定が必要です');
    return;
  }
  
  if (!props.clubId) return;
  
  try {
    await client.models.ClubApplication.create({
      clubId: props.clubId,
      applicantUserId: props.user.userId,
      status: 'pending'
    });
    
    // メール通知送信（Lambda関数呼び出し）
    try {
      // amplify_outputs.jsonからFunction URLを取得
      const outputs = await import('../../amplify_outputs.json');
      const functionUrl = (outputs as any).custom?.functionUrl;
      
      if (functionUrl && club.value?.representativeEmail) {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            representativeEmail: club.value.representativeEmail,
            applicantName: userProfile.value.name,
            applicantDepartment: userProfile.value.department,
            applicantSection: userProfile.value.section,
            clubName: club.value.name
          })
        });
        
        if (response.ok) {
          console.log('メール通知送信成功');
        } else {
          console.error('メール通知送信エラー:', response.statusText);
        }
      } else {
        console.log('メール通知ログ出力:', {
          representativeEmail: club.value?.representativeEmail,
          applicantName: userProfile.value.name,
          clubName: club.value?.name
        });
      }
    } catch (emailError) {
      console.error('メール通知エラー:', emailError);
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

async function cancelApplication() {
  if (!confirm('参加申請を取り消しますか？')) {
    return;
  }
  
  try {
    if (!props.clubId) return;
    
    // 申請を削除
    const { data: applications } = await client.models.ClubApplication.list({
      filter: { 
        clubId: { eq: props.clubId },
        applicantUserId: { eq: props.user.userId }
      }
    });
    
    if (applications.length > 0) {
      await client.models.ClubApplication.delete({ id: applications[0].id });
      
      // キャンセル通知メール送信
      try {
        const outputs = await import('../../amplify_outputs.json');
        const functionUrl = (outputs as any).custom?.functionUrl;
        
        if (functionUrl && club.value?.representativeEmail) {
          await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'cancel',
              representativeEmail: club.value.representativeEmail,
              applicantName: userProfile.value?.name,
              applicantDepartment: userProfile.value?.department,
              applicantSection: userProfile.value?.section,
              clubName: club.value.name
            })
          });
          console.log('キャンセル通知送信成功');
        }
      } catch (emailError) {
        console.error('キャンセル通知エラー:', emailError);
      }
      
      hasApplied.value = false;
      alert('参加申請を取り消しました');
    }
  } catch (error) {
    console.error('申請取り消しエラー:', error);
    alert('申請取り消しに失敗しました');
  }
}

function showApplicationsList() {
  if (props.clubId) {
    emit('showApplications', props.clubId);
  }
}

onMounted(() => {
  loadClub();
  loadWikiPage();
  loadUserProfile();
  checkApplicationStatus();
  loadApprovedParticipants();
});
</script>

<template>
  <div style="height: 100vh; padding: 1rem; box-sizing: border-box; display: flex; flex-direction: column;">
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

    <div v-if="!isEditing" class="card" style="flex: 1; overflow-y: auto; margin-bottom: 1rem;">
      <div v-if="hasContent" style="overflow-y: auto; max-height: calc(100vh - 200px);">
        <h1 style="margin: 0 0 1rem 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">
          {{ wikiPage?.title }}
        </h1>
        
        <div style="line-height: 1.6; white-space: pre-wrap; color: #444;">
          {{ wikiPage?.content }}
        </div>
        
        <div v-if="approvedParticipants.length > 0" style="margin-top: 2rem; padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 0.75rem 0; color: #333; font-size: 0.9rem;">参加者一覧 ({{ approvedParticipants.length }}名)</h3>
          <div style="display: flex; flex-direction: column; gap: 0.3rem;">
            <div v-for="participant in approvedParticipants" :key="participant.name" 
                 style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; background: white; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8rem;">
              <span style="font-weight: bold; color: #333;">{{ participant.name }}</span>
              <span style="color: #666;">{{ participant.department }} / {{ participant.section }}</span>
              <div v-if="participant.hobbyTags.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.2rem; margin-left: auto;">
                <span v-for="tag in participant.hobbyTags" :key="tag"
                      style="background: #e3f2fd; color: #1976d2; padding: 0.1rem 0.3rem; border-radius: 8px; font-size: 0.7rem; white-space: nowrap;">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
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
            <button v-if="hasApplied && applicationStatus === 'pending' && !isClubRepresentative()" @click="cancelApplication"
                    style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
              申請取り消し
            </button>
            <span v-if="hasApplied && applicationStatus === 'approved' && !isClubRepresentative()" 
                  style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #6c757d; color: white; border-radius: 4px; cursor: not-allowed;">
              参加済み
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