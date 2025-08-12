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
const tagMaster = ref<Array<Schema['TagMaster']['type']>>([]);
const categories = ref<string[]>([]);
const showCreateForm = ref(false);
const newClub = ref({
  name: '',
  category: ''
});
const editingClubId = ref<string | null>(null);
const editClub = ref({
  name: '',
  category: ''
});

let clubSubscription: any = null;
let tagSubscription: any = null;

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

function loadTagMaster() {
  if (tagSubscription) {
    tagSubscription.unsubscribe();
  }
  
  tagSubscription = client.models.TagMaster.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }) => {
      tagMaster.value = items.sort((a, b) => a.name.localeCompare(b.name));
      const allCategories = [...new Set(items.map(item => item.category))];
      categories.value = allCategories.sort();
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
      category: newClub.value.category,
      createdBy: props.user.username || props.user.userId || props.user.sub || 'anonymous'
    });
    
    showCreateForm.value = false;
    newClub.value = { name: '', category: '' };
  } catch (error) {
    console.error('部活動作成エラー:', error);
    alert('部活動作成に失敗しました');
  }
}

function showWikiPage(clubId: string) {
  emit('showWiki', clubId);
}

function isClubOwner(club: Schema['Club']['type']) {
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  return club.createdBy === currentUser;
}

function startEditClub(club: Schema['Club']['type'], clickEvent: Event) {
  clickEvent.stopPropagation();
  editingClubId.value = club.id;
  editClub.value = {
    name: club.name || '',
    category: club.category || ''
  };
}

async function updateClub() {
  if (!editClub.value.name) {
    alert('部活動名は必須です');
    return;
  }
  
  try {
    await client.models.Club.update({
      id: editingClubId.value!,
      name: editClub.value.name,
      category: editClub.value.category
    });
    
    editingClubId.value = null;
    editClub.value = { name: '', category: '' };
  } catch (error) {
    console.error('部活動更新エラー:', error);
    alert('部活動更新に失敗しました');
  }
}

function cancelEdit() {
  editingClubId.value = null;
  editClub.value = { name: '', category: '' };
}

function deleteClub(club: Schema['Club']['type'], clickEvent: Event) {
  clickEvent.stopPropagation();
  
  if (!isClubOwner(club)) {
    alert('自分が作成した部活動のみ削除できます');
    return;
  }
  
  if (confirm(`「${club.name}」を削除しますか？`)) {
    client.models.Club.delete({ id: club.id }).then(() => {
      console.log('部活動削除成功');
    }).catch((error) => {
      console.error('部活動削除エラー:', error);
      alert('部活動削除に失敗しました');
    });
  }
}

onMounted(() => {
  loadClubs();
  loadTagMaster();
});

onUnmounted(() => {
  if (clubSubscription) {
    clubSubscription.unsubscribe();
  }
  if (tagSubscription) {
    tagSubscription.unsubscribe();
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
              style="padding: 0.4rem 0.8rem; font-size: 0.9rem; background: #ff9800; color: white; border: none; border-radius: 4px;">
        {{ showCreateForm ? 'キャンセル' : '部活動作成' }}
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
          <label>カテゴリ</label>
          <select v-model="newClub.category">
            <option value="">カテゴリを選択</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <div class="form-group">
          <button @click="createClub" type="button">作成</button>
        </div>
      </div>
    </div>

    <div v-if="editingClubId" class="card" style="margin-bottom: 1rem;">
      <h3>部活動編集</h3>
      <div class="form-container">
        <div class="form-group">
          <label>部活動名 *</label>
          <input v-model="editClub.name" placeholder="部活動名" required />
        </div>
        <div class="form-group">
          <label>カテゴリ</label>
          <select v-model="editClub.category">
            <option value="">カテゴリを選択</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <div class="form-group">
          <div style="display: flex; gap: 1rem;">
            <button @click="updateClub" type="button">更新</button>
            <button @click="cancelEdit" type="button" style="background: #6c757d;">キャンセル</button>
          </div>
        </div>
      </div>
    </div>

    <div class="clubs-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div v-for="club in clubs" :key="club.id" 
           class="card club-card" 
           @click="showWikiPage(club.id)"
           style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; padding: 0.75rem; position: relative;"
           @mouseover="($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'"
           @mouseout="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'">
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h3 style="margin: 0; color: #333; font-size: 1.1rem; flex: 1;">{{ club.name }}</h3>
          
          <span v-if="club.category" 
                style="background: #e3f2fd; color: #1976d2; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">
            {{ club.category }}
          </span>
          
          <div v-if="isClubOwner(club)" style="display: flex; gap: 0.25rem;">
            <button @click="startEditClub(club, $event)" 
                    style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: #28a745; color: white; border: none; border-radius: 3px;">
              編集
            </button>
            <button @click="deleteClub(club, $event)" 
                    style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: #dc3545; color: white; border: none; border-radius: 3px;">
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="clubs.length === 0" style="text-align: center; padding: 2rem; color: white;">
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