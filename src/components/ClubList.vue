<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { generateClubId } from '../utils/idGenerator';

const client = generateClient<Schema>();

const props = defineProps<{
  user: any;
}>();

const emit = defineEmits<{
  back: [];
  showWiki: [clubId: string];
}>();

const clubs = ref<Array<Schema['Club']['type']>>([]);
const showCreateForm = ref(false);
const newClub = ref({
  name: '',
  description: '',
  category: ''
});

let clubSubscription: any = null;

function loadClubs() {
  if (clubSubscription) {
    clubSubscription.unsubscribe();
  }
  
  clubSubscription = client.models.Club.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }) => {
      clubs.value = items.sort((a, b) => a.name.localeCompare(b.name));
    },
    error: (error) => {
      console.error('部活動データ取得エラー:', error);
    }
  });
}

async function createClub() {
  if (!newClub.value.name) {
    alert('部活動名は必須です');
    return;
  }
  
  try {
    const customId = await generateClubId();
    await client.models.Club.create({
      id: customId,
      name: newClub.value.name,
      description: newClub.value.description,
      category: newClub.value.category,
      createdBy: props.user.username || props.user.userId || props.user.sub || 'anonymous'
    });
    
    showCreateForm.value = false;
    newClub.value = { name: '', description: '', category: '' };
  } catch (error) {
    console.error('部活動作成エラー:', error);
    alert('部活動作成に失敗しました');
  }
}

function showWikiPage(clubId: string) {
  emit('showWiki', clubId);
}

onMounted(() => {
  loadClubs();
});

onUnmounted(() => {
  if (clubSubscription) {
    clubSubscription.unsubscribe();
  }
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
      
      <h2 style="margin: 0; flex: 1;">部活動一覧</h2>
      
      <button @click="showCreateForm = !showCreateForm" 
              style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
        {{ showCreateForm ? 'キャンセル' : '新規作成' }}
      </button>
    </div>

    <div v-if="showCreateForm" class="card" style="margin-bottom: 1rem;">
      <h3>新規部活動作成</h3>
      <div class="form-container">
        <div class="form-group">
          <label>部活動名 *</label>
          <input v-model="newClub.name" placeholder="部活動名" required />
        </div>
        <div class="form-group">
          <label>説明</label>
          <textarea v-model="newClub.description" placeholder="部活動の説明" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>カテゴリ</label>
          <select v-model="newClub.category">
            <option value="">カテゴリを選択</option>
            <option value="スポーツ">スポーツ</option>
            <option value="文化">文化</option>
            <option value="技術">技術</option>
            <option value="趣味">趣味</option>
            <option value="その他">その他</option>
          </select>
        </div>
        <div class="form-group">
          <button @click="createClub" type="button">作成</button>
        </div>
      </div>
    </div>

    <div class="clubs-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
      <div v-for="club in clubs" :key="club.id" 
           class="card club-card" 
           @click="showWikiPage(club.id)"
           style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;"
           @mouseover="($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'"
           @mouseout="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'">
        
        <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem;">{{ club.name }}</h3>
        
        <p v-if="club.description" 
           style="margin: 0.5rem 0; color: #666; font-size: 0.9rem; line-height: 1.4;">
          {{ club.description }}
        </p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <span v-if="club.category" 
                style="background: #e3f2fd; color: #1976d2; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">
            {{ club.category }}
          </span>
          <span style="color: #999; font-size: 0.8rem;">
            Wikiを見る →
          </span>
        </div>
      </div>
    </div>

    <div v-if="clubs.length === 0" style="text-align: center; padding: 2rem; color: #666;">
      <p>まだ部活動が登録されていません</p>
      <p>新規作成ボタンから部活動を追加してください</p>
    </div>
  </div>
</template>

<style scoped>
.club-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>