<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ClubService, type Club, type WikiPage, type Participant } from '../../services/clubService';
import { AuthService, type UserProfile } from '../../services/authService';
import { NotificationService } from '../../services/notificationService';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';

const props = defineProps<{
  clubId: string | null;
  user: any;
}>();

const emit = defineEmits<{
  back: [];
  showApplications: [clubId: string];
}>();

const club = ref<Club | null>(null);
const wikiPage = ref<WikiPage | null>(null);
const isEditing = ref(false);
const editForm = ref({
  title: '',
  content: ''
});
const hasApplied = ref(false);
const applicationStatus = ref<string>('');
const userProfile = ref<UserProfile | null>(null);
const approvedParticipants = ref<Participant[]>([]);

const hasContent = computed(() => wikiPage.value && wikiPage.value.content);

const wikiTemplate = `# 部活動名：[ここに部活動名]

## 活動目的
[部活動を始めた理由や目的を簡単に記載]

## 主な活動内容
- [どんな活動をしているかを箇条書きで簡潔に記載]
- [例：月1回の練習や勉強会、社内イベントの企画 など]

## 活動予定
- [次回の活動日・場所・内容など]
- [例：9月10日 社内会議室にてボードゲーム会]

## 参加方法・連絡先
[参加方法や、問い合わせ先（担当者名やメールアドレス）を記載]`;

function applyTemplate() {
  editForm.value.content = wikiTemplate;
}

async function loadClub() {
  if (!props.clubId) return;
  club.value = await ClubService.getClub(props.clubId);
}

async function loadWikiPage() {
  if (!props.clubId) return;
  
  wikiPage.value = await ClubService.getWikiPage(props.clubId);
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
  
  if (!props.clubId) return;
  
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  
  const wikiData: WikiPage = {
    id: wikiPage.value?.id,
    clubId: props.clubId,
    title: editForm.value.title,
    content: editForm.value.content,
    lastEditedBy: currentUser
  };
  
  const success = await ClubService.saveWikiPage(wikiData);
  if (success) {
    isEditing.value = false;
    await loadWikiPage();
  } else {
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

async function loadUserProfile() {
  userProfile.value = await AuthService.getUserProfile(props.user.userId);
}

async function checkApplicationStatus() {
  if (!props.clubId) return;
  
  const status = await ClubService.getApplicationStatus(props.clubId, props.user.userId);
  hasApplied.value = status !== '';
  applicationStatus.value = status;
}

async function loadApprovedParticipants() {
  if (!props.clubId) return;
  approvedParticipants.value = await ClubService.getApprovedParticipants(props.clubId);
}

async function applyToClub() {
  if (!userProfile.value || !userProfile.value.name || !userProfile.value.department || !userProfile.value.section) {
    alert('参加申請にはプロフィールの名前、部門、課/グループの設定が必要です');
    return;
  }
  
  if (!props.clubId || !club.value) return;
  
  const success = await ClubService.applyToClub({
    clubId: props.clubId,
    applicantUserId: props.user.userId
  });
  
  if (success) {
    // メール通知送信
    if (club.value.representativeEmail) {
      await NotificationService.sendApplicationNotification({
        representativeEmail: club.value.representativeEmail,
        applicantName: userProfile.value.name,
        applicantDepartment: userProfile.value.department,
        applicantSection: userProfile.value.section,
        clubName: club.value.name
      });
    }
    
    hasApplied.value = true;
    applicationStatus.value = 'pending';
    alert('参加申請を送信しました');
  } else {
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
  
  if (!props.clubId || !club.value) return;
  
  const success = await ClubService.cancelApplication(props.clubId, props.user.userId);
  
  if (success) {
    // キャンセル通知メール送信
    if (club.value.representativeEmail && userProfile.value) {
      await NotificationService.sendCancellationNotification({
        representativeEmail: club.value.representativeEmail,
        applicantName: userProfile.value.name,
        applicantDepartment: userProfile.value.department || '',
        applicantSection: userProfile.value.section || '',
        clubName: club.value.name
      });
    }
    
    hasApplied.value = false;
    applicationStatus.value = '';
    alert('参加申請を取り消しました');
  } else {
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
      <BaseButton variant="primary" size="small" @click="emit('back')">
        ← 戻る
      </BaseButton>
      
      <div style="flex: 1;"></div>
      
      <BaseButton v-if="!isEditing" variant="primary" size="small" @click="startEditing">
        {{ hasContent ? '編集' : '作成' }}
      </BaseButton>
    </div>

    <div v-if="!isEditing" style="flex: 1; overflow-y: auto; padding-bottom: 2rem;">
      <BaseCard v-if="hasContent" :rounded="true" style="padding: 1rem; margin-bottom: 9.5rem;">
        <h1 style="margin: 0 0 1rem 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">
          {{ wikiPage?.title }}
        </h1>
        
        <div style="line-height: 1.6; white-space: pre-wrap; color: #444; margin-bottom: 1rem;">
          {{ wikiPage?.content }}
        </div>
        
        <div v-if="approvedParticipants.length > 0" style="margin-bottom: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
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
        
        <div style="padding-top: 1rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
          <span>最終更新: {{ wikiPage?.updatedAt ? new Date(wikiPage.updatedAt).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '未設定' }}</span>
          <div style="display: flex; gap: 0.5rem;">
            <BaseButton v-if="isClubRepresentative()" variant="info" size="small" @click="showApplicationsList">
              申請者一覧
            </BaseButton>
            <BaseButton v-if="!hasApplied && !isClubRepresentative()" variant="success" size="small" @click="applyToClub">
              参加申請
            </BaseButton>
            <BaseButton v-if="hasApplied && applicationStatus === 'pending' && !isClubRepresentative()" variant="danger" size="small" @click="cancelApplication">
              申請取り消し
            </BaseButton>
            <span v-if="hasApplied && applicationStatus === 'approved' && !isClubRepresentative()" 
                  style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #6c757d; color: white; border-radius: 4px;">
              参加済み
            </span>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard v-else :rounded="true" style="text-align: center; padding: 3rem; color: #666; margin-bottom: 10rem;">
        <h3>まだWikiページが作成されていません</h3>
        <p>「作成」ボタンを押してWikiページを作成してください</p>
      </BaseCard>
    </div>

    <BaseCard v-else>
      <h3>Wiki編集</h3>
      <div class="form-container">
        <div class="form-group">
          <label>タイトル *</label>
          <input v-model="editForm.title" placeholder="Wikiタイトル" required />
        </div>
        
        <div class="form-group">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <label>内容</label>
            <BaseButton variant="template" size="small" @click="applyTemplate">
              テンプレート
            </BaseButton>
          </div>
          <textarea v-model="editForm.content" 
                    placeholder="Wikiの内容を入力してください&#10;&#10;例:&#10;## 部活動について&#10;この部活動は...&#10;&#10;## 活動内容&#10;- 定期的な練習&#10;- イベント参加&#10;&#10;## 連絡先&#10;部長: 田中太郎"
                    rows="15"
                    style="font-family: 'Noto Sans JP', monospace; line-height: 1.5;"></textarea>
        </div>
        
        <div class="form-group">
          <div style="display: flex; gap: 1rem;">
            <BaseButton variant="success" @click="saveWiki">保存</BaseButton>
            <BaseButton variant="secondary" @click="cancelEdit">キャンセル</BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>