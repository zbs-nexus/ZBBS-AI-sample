<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ClubService } from '../../services/clubService';
import { AuthService } from '../../services/authService';
import { UIService } from '../../services/uiService';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';

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
    // 実際の実装では、ClubServiceを拡張して申請者一覧取得メソッドを追加する必要があります
    const { generateClient } = await import('aws-amplify/data');
    const client = generateClient();
    
    const { data: applications } = await client.models.ClubApplication.list({
      filter: { 
        clubId: { eq: props.clubId },
        status: { eq: 'pending' }
      }
    });

    const participantData = [];
    for (const app of applications) {
      const profile = await AuthService.getUserProfile(app.applicantUserId);
      
      if (profile) {
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
    const { generateClient } = await import('aws-amplify/data');
    const client = generateClient();
    
    await client.models.ClubApplication.update({
      id: applicationId,
      status: 'approved'
    });
    
    await loadParticipants();
    UIService.showAlert('申請を承認しました');
  } catch (error) {
    console.error('承認エラー:', error);
    UIService.showAlert('承認に失敗しました');
  }
}

onMounted(() => {
  loadParticipants();
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
      <BaseButton variant="primary" size="small" @click="emit('back')">
        ← 戻る
      </BaseButton>
      
      <h2 style="margin: 0; flex: 1;">{{ clubName }} - 申請者一覧</h2>
    </div>

    <BaseCard>
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
                <BaseButton v-if="participant.status === 'pending'" 
                           variant="success" size="small" 
                           @click="approveParticipant(participant.id)">
                  承認
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 3rem; color: #666;">
        <h3>申請者はまだいません</h3>
        <p>参加申請があると、ここに表示されます</p>
      </div>
    </BaseCard>
  </div>
</template>