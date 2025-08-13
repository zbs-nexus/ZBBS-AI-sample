<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const props = defineProps<{
  clubId: string;
  clubName: string;
}>();

const emit = defineEmits<{
  back: [];
}>();

const participants = ref<Array<{
  id: string;
  name: string;
  department: string;
  section: string;
  status: string;
}>>([]);

async function loadParticipants() {
  try {
    const { data: applications } = await client.models.ClubApplication.list({
      filter: { 
        clubId: { eq: props.clubId },
        status: { eq: 'pending' }
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
          id: app.id,
          name: profile.name || '名前未設定',
          department: profile.department || '部門未設定',
          section: profile.section || '課未設定',
          status: app.status || 'pending'
        });
      }
    }
    
    participants.value = participantData;
  } catch (error) {
    console.error('申請者一覧取得エラー:', error);
  }
}

async function approveParticipant(applicationId: string) {
  try {
    await client.models.ClubApplication.update({
      id: applicationId,
      status: 'approved'
    });
    
    // 一覧を再読み込み
    await loadParticipants();
    alert('申請を承認しました');
  } catch (error) {
    console.error('承認エラー:', error);
    alert('承認に失敗しました');
  }
}

onMounted(() => {
  loadParticipants();
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
      
      <h2 style="margin: 0; flex: 1;">{{ clubName }} - 申請者一覧</h2>
    </div>

    <div class="card">
      <div v-if="participants.length > 0">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div v-for="participant in participants" :key="participant.id" 
               style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0 0 0.5rem 0; color: #333;">{{ participant.name }}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                  {{ participant.department }} / {{ participant.section }}
                </p>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span :style="`padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; color: white;
                  background: ${participant.status === 'pending' ? '#ffc107' : '#28a745'};`">
                  {{ participant.status === 'pending' ? '申請中' : '承認済み' }}
                </span>
                <button v-if="participant.status === 'pending'" @click="approveParticipant(participant.id)"
                        style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  承認
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 3rem; color: #666;">
        <h3>申請者はまだいません</h3>
        <p>参加申請があると、ここに表示されます</p>
      </div>
    </div>
  </div>
</template>