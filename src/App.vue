<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref } from 'vue';
import EventTimeline from './components/EventTimeline.vue';
import EventDetail from './components/EventDetail.vue';
import UserProfile from './components/UserProfile.vue';

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
</script>

<template>
  <main>
    <authenticator>
      <template v-slot="{ signOut, user }">
        <nav style="padding: 1rem; border-bottom: 1px solid #ccc; display: flex; gap: 1rem; align-items: center;">
          <h1>部活イベント掲示板</h1>
          <button @click="showTimeline">イベント一覧</button>
          <button @click="showProfile">プロフィール</button>
          <button @click="signOut" style="margin-left: auto;">ログアウト</button>
        </nav>
        
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
      </template>
    </authenticator>
  </main>
</template>

