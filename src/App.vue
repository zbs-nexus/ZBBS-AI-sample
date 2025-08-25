<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref, onMounted } from 'vue';
import EventTimeline from './components/EventTimeline.vue';
import EventDetail from './components/EventDetail.vue';
import UserProfile from './components/UserProfile.vue';
import ClubList from './components/ClubList.vue';
import WikiPage from './components/clubs/WikiPage.vue';
import ClubApplications from './components/clubs/ClubApplications.vue';
import ClubParticipants from './components/ClubParticipants.vue';
import { seedTagMaster, addNewTags } from './utils/seedData';
import { I18n } from 'aws-amplify/utils';

// 日本語翻訳を設定
const jaTranslations = {
  'Sign In': 'サインイン',
  'Sign Up': 'サインアップ',
  'Email': 'メールアドレス',
  'Password': 'パスワード',
  'Confirm Password': 'パスワード確認',
  'Sign in': 'サインイン',
  'Create Account': 'アカウント作成',
  'Forgot your password?': 'パスワードをお忘れですか？',
  'Reset password': 'パスワードリセット',
  'Send code': 'コード送信',
  'Code': '確認コード',
  'Confirm': '確認',
  'Back to Sign In': 'サインインに戻る',
  'Have an account?': 'アカウントをお持ちですか？',
  'No account?': 'アカウントをお持ちでないですか？',
  'Sign Out': 'サインアウト'
};

I18n.putVocabularies({
  ja: jaTranslations
});

I18n.setLanguage('ja');

const currentView = ref('timeline');
const selectedEventId = ref<string | null>(null);
const selectedClubId = ref<string | null>(null);
const selectedClubName = ref<string>('');

function showEventDetail(eventId: string) {
  selectedEventId.value = eventId;
  currentView.value = 'detail';
}

function showProfile() {
  currentView.value = 'profile';
}

function showTimeline() {
  currentView.value = 'timeline';
}

function showClubList() {
  currentView.value = 'clubs';
}

function showWikiPage(clubId: string) {
  selectedClubId.value = clubId;
  currentView.value = 'wiki';
}

function showEventDetailFromProfile(eventId: string) {
  selectedEventId.value = eventId;
  currentView.value = 'detail';
}

function showClubApplications(clubId: string) {
  selectedClubId.value = clubId;
  currentView.value = 'applications';
}

function showClubParticipants(clubId: string, clubName: string) {
  selectedClubId.value = clubId;
  selectedClubName.value = clubName;
  currentView.value = 'participants';
}

onMounted(() => {
  // 初期データを投入
  seedTagMaster();
  // 新しいタグを追加（必要な時のみコメントアウトを外す）
  // addNewTags();
});
</script>

<template>
  <main style="height: 100vh; display: flex; flex-direction: column;">
    <authenticator>
      <template v-slot="{ signOut, user }">
        <nav style="padding: 1rem; border-bottom: 1px solid #ccc; display: flex; gap: 0.5rem; align-items: center; background: white; position: sticky; top: 0; z-index: 100; border-radius: 16px;">
          <img src="/src/assets/logo.png" alt="ZBBS部" style="height: 80px; width: auto;" />
          <button @click="showTimeline">イベント一覧</button>
          <button @click="showClubList">部活動一覧</button>
          <button @click="showProfile">プロフィール</button>
        </nav>
        
        <div style="flex: 1; overflow: hidden;">
          <EventTimeline 
            v-if="currentView === 'timeline'" 
            :user="user" 
            @show-detail="showEventDetail" 
          />
          
          <EventDetail 
            v-if="currentView === 'detail'" 
            :event-id="selectedEventId" 
            :user="user" 
            @back="showTimeline" 
          />
          
          <UserProfile 
            v-if="currentView === 'profile'" 
            :user="user" 
            :signOut="signOut"
            @back="showTimeline" 
            @show-event-detail="showEventDetailFromProfile"
          />
          
          <ClubList 
            v-if="currentView === 'clubs'" 
            :user="user" 
            @back="showTimeline" 
            @show-wiki="showWikiPage"
            @show-participants="showClubParticipants"
          />
          
          <WikiPage 
            v-if="currentView === 'wiki'" 
            :club-id="selectedClubId" 
            :user="user" 
            @back="showClubList" 
            @show-applications="showClubApplications"
          />
          
          <ClubApplications 
            v-if="currentView === 'applications'" 
            :club-id="selectedClubId" 
            :user="user" 
            @back="() => { currentView = 'wiki' }" 
          />
          
          <ClubParticipants 
            v-if="currentView === 'participants'" 
            :club-id="selectedClubId!" 
            :club-name="selectedClubName" 
            @back="showClubList" 
          />
        </div>
      </template>
    </authenticator>
  </main>
</template>

