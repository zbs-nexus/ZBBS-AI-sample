<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { EventService, type Event, type ParticipantInfo } from '../../services/eventService';
import { AuthService, type UserProfile } from '../../services/authService';
import { UIService } from '../../services/uiService';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
import BaseTag from '../shared/BaseTag.vue';

const props = defineProps<{
  eventId: string | null;
  user: any;
}>();

const emit = defineEmits<{
  back: [];
}>();

const event = ref<Event | null>(null);
const participants = ref<ParticipantInfo[]>([]);
const isParticipating = ref(false);
const userProfile = ref<UserProfile | null>(null);

const participantCount = computed(() => participants.value.length);
const isRecruitmentExpired = computed(() => {
  if (!event.value?.recruitmentDeadline) return false;
  return new Date(event.value.recruitmentDeadline) < new Date();
});
const canJoin = computed(() => 
  event.value && 
  (!event.value.maxParticipants || participantCount.value < event.value.maxParticipants) &&
  !isRecruitmentExpired.value
);

async function loadEvent() {
  if (!props.eventId) return;
  
  event.value = await EventService.getEvent(props.eventId);
  participants.value = await EventService.getEventParticipants(props.eventId);
  isParticipating.value = await EventService.getParticipationStatus(props.eventId, props.user.userId);
}

async function loadUserProfile() {
  userProfile.value = await AuthService.getUserProfile(props.user.userId);
}

function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  return !!(profile.name && 
           profile.department && 
           profile.section && 
           profile.hobbyTags && 
           profile.hobbyTags.length > 0);
}

async function joinEvent() {
  if (!props.eventId || !canJoin.value) return;
  
  if (!isProfileComplete(userProfile.value)) {
    UIService.showAlert('イベントに参加するには、プロフィールのすべての項目（名前、部、課、趣味タグ）を設定してください。');
    return;
  }
  
  const success = await EventService.joinEvent(props.eventId, props.user.userId);
  if (success) {
    await loadEvent();
  } else {
    UIService.showAlert('イベント参加に失敗しました');
  }
}

async function leaveEvent() {
  if (!props.eventId) return;
  
  const success = await EventService.leaveEvent(props.eventId, props.user.userId);
  if (success) {
    await loadEvent();
  } else {
    UIService.showAlert('イベント退会に失敗しました');
  }
}

onMounted(() => {
  loadEvent();
  loadUserProfile();
});
</script>

<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <div style="padding: 0.3rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.2); background: transparent;">
      <BaseButton variant="primary" size="small" @click="emit('back')" style="margin-bottom: 0.5rem;">
        ← 戻る
      </BaseButton>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 0.3rem 0.5rem;">
      <BaseCard v-if="event" style="padding: 0.75rem;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.3rem;">{{ event.title }}</h2>
        <p style="margin: 0.5rem 0; font-size: 0.9rem; line-height: 1.4; white-space: pre-wrap;">{{ event.description }}</p>
        
        <div style="margin: 0.5rem 0;">
          <p style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>開催日時:</strong> {{ UIService.formatDate(event.date) }}</p>
          <p v-if="event.endDate" style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>終了日時:</strong> {{ UIService.formatDate(event.endDate) }}</p>
          <p v-if="event.recruitmentDeadline" style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>募集期限:</strong> {{ UIService.formatDate(event.recruitmentDeadline) }}</p>
          <p v-if="event.location" style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>開催場所:</strong> {{ event.location }}</p>
          <p style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>参加者数:</strong> {{ participantCount }}{{ event.maxParticipants ? ` / ${event.maxParticipants}` : '' }}人</p>
          <p v-if="event.targetAudience" style="margin: 0.2rem 0; font-size: 0.85rem;"><strong>参加対象:</strong> {{ event.targetAudience }}</p>
        </div>
        
        <div v-if="participants.length" style="margin: 0.3rem 0;">
          <strong style="font-size: 0.85rem;">参加者一覧:</strong>
          <div style="max-height: 120px; overflow-y: auto; margin-top: 0.2rem; border: 1px solid #ddd; border-radius: 4px; padding: 0.2rem;">
            <div v-for="participant in participants" :key="participant.name" 
                 style="padding: 0.15rem 0.2rem; margin-bottom: 0.05rem; background: rgba(66, 133, 244, 0.03); border-radius: 3px; border-left: 1px solid #4285f4;">
              <div style="display: flex; align-items: center; gap: 0.3rem;">
                <strong style="color: #333; font-size: 0.8rem;">{{ participant.name }}</strong>
                <span v-if="participant.hobbyTags?.length" style="font-size: 0.7rem; color: #666;">
                  <BaseTag v-for="(hobby, index) in participant.hobbyTags.slice(0, 10)" :key="index" 
                           :text="hobby" variant="success" size="small"
                           style="margin-right: 0.1rem; margin-bottom: 0.1rem;" />
                  <span v-if="participant.hobbyTags.length > 10" style="color: #999; font-size: 0.65rem;">+{{ participant.hobbyTags.length - 10 }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="event.tags?.length" style="margin: 0.5rem 0;">
          <strong style="font-size: 0.9rem;">タグ:</strong>
          <div style="margin-top: 0.3rem;">
            <BaseTag v-for="(tag, index) in event.tags" :key="index" 
                     :text="tag" variant="info" size="small"
                     style="margin-right: 0.3rem; margin-bottom: 0.3rem;" />
          </div>
        </div>
        
        <div style="margin-top: 2rem; padding-bottom: 2rem;">
          <BaseButton v-if="!isParticipating && canJoin" 
                      variant="success" @click="joinEvent">
            参加する
          </BaseButton>
          
          <BaseButton v-if="isParticipating" 
                      variant="danger" @click="leaveEvent">
            参加をキャンセル
          </BaseButton>
          
          <p v-if="!canJoin && !isParticipating && !isRecruitmentExpired" 
             style="color: #dc3545; margin-top: 0.3rem; font-size: 0.85rem;">
            定員に達しています
          </p>
          
          <p v-if="isRecruitmentExpired && !isParticipating" 
             style="color: #dc3545; margin-top: 0.3rem; font-size: 0.85rem;">
            募集期限が終了しています
          </p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>