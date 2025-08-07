<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref, onMounted } from 'vue';
import EventTimeline from './components/EventTimeline.vue';
import EventDetail from './components/EventDetail.vue';
import UserProfile from './components/UserProfile.vue';
import { seedTagMaster } from './utils/seedData';

const currentView = ref('timeline');
const selectedEventId = ref<string | null>(null);

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

onMounted(() => {
  // 初期データを投入
  seedTagMaster();
});
</script>

<template>
  <main style="height: 100vh; display: flex; flex-direction: column;">
    <authenticator>
      <template v-slot="{ signOut, user }">
        <nav style="padding: 1rem; border-bottom: 1px solid #ccc; display: flex; gap: 1rem; align-items: center; background: white; position: sticky; top: 0; z-index: 100;">
          <img src="/src/assets/logo.png" alt="ZBBS部" style="height: 40px; width: auto;" />
          <h1 style="margin: 0;">ZBBS部</h1>
          <button @click="showTimeline">イベント一覧</button>
          <button @click="showProfile">プロフィール</button>
          <button @click="signOut" style="margin-left: auto;">ログアウト</button>
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
            @back="showTimeline" 
          />
        </div>
      </template>
    </authenticator>
  </main>
</template>

