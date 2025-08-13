<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const props = defineProps<{
  clubId: string | null;
  user: any;
}>();

const emit = defineEmits<{
  back: [];
}>();

const applications = ref<Array<Schema['ClubApplication']['type']>>([]);
const applicantProfiles = ref<Array<Schema['UserProfile']['type']>>([]);
const club = ref<Schema['Club']['type'] | null>(null);

function loadClub() {
  if (!props.clubId) return;
  
  client.models.Club.get({ id: props.clubId }).then(({ data }) => {
    club.value = data;
  });
}

function loadApplications() {
  if (!props.clubId) return;
  
  client.models.ClubApplication.observeQuery({
    filter: { clubId: { eq: props.clubId } }
  }).subscribe({
    next: ({ items }) => {
      applications.value = items;
      loadApplicantProfiles(items);
    }
  });
}

function loadApplicantProfiles(applicationList: Array<Schema['ClubApplication']['type']>) {
  const userIds = applicationList.map(app => app.applicantUserId);
  
  if (userIds.length === 0) {
    applicantProfiles.value = [];
    return;
  }
  
  client.models.UserProfile.list().then(({ data }) => {
    applicantProfiles.value = data.filter(profile => userIds.includes(profile.userId));
  });
}

function getApplicantProfile(userId: string) {
  return applicantProfiles.value.find(profile => profile.userId === userId);
}

onMounted(() => {
  loadClub();
  loadApplications();
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
      
      <h2 style="margin: 0; flex: 1;">{{ club?.name }} 参加申請者一覧</h2>
    </div>

    <div class="card">
      <div v-if="applications.length > 0">
        <div v-for="application in applications" :key="application.id" 
             style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 0.5rem 0; color: #333;">
                {{ getApplicantProfile(application.applicantUserId)?.name || '名前未設定' }}
              </h4>
              <p style="margin: 0.2rem 0; font-size: 0.9rem; color: #666;">
                <strong>ユーザーID:</strong> {{ application.applicantUserId }}
              </p>
              <p style="margin: 0.2rem 0; font-size: 0.9rem; color: #666;">
                <strong>所属:</strong> 
                {{ getApplicantProfile(application.applicantUserId)?.department || '未設定' }} / 
                {{ getApplicantProfile(application.applicantUserId)?.section || '未設定' }}
              </p>
              <p style="margin: 0.2rem 0; font-size: 0.9rem; color: #666;">
                <strong>申請日時:</strong> {{ new Date(application.createdAt).toLocaleString() }}
              </p>
              <p style="margin: 0.2rem 0; font-size: 0.9rem;">
                <strong>ステータス:</strong> 
                <span :style="{ 
                  color: application.status === 'pending' ? '#ffc107' : 
                         application.status === 'approved' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }">
                  {{ application.status === 'pending' ? '申請中' : 
                     application.status === 'approved' ? '承認済み' : '却下' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 3rem; color: #666;">
        <h3>参加申請はありません</h3>
        <p>まだ参加申請が届いていません</p>
      </div>
    </div>
  </div>
</template>