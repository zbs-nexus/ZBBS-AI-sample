<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ClubService, type Club } from '../../services/clubService';
import { UIService } from '../../services/uiService';
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
import BaseInput from '../shared/BaseInput.vue';
import BaseTag from '../shared/BaseTag.vue';
import BaseModal from '../shared/BaseModal.vue';

const props = defineProps<{
  user: any;
}>();

const emit = defineEmits<{
  back: [];
  showWiki: [clubId: string];
  showParticipants: [clubId: string, clubName: string];
}>();

const clubs = ref<Club[]>([]);
const tagCategories = ref<Array<{ name: string; tags: string[] }>>([]);
const showCreateModal = ref(false);
const selectedCategory = ref<string>('');
const selectedEditCategory = ref<string>('');
const newClub = ref({
  name: '',
  tags: [] as string[],
  representativeEmail: ''
});
const editingClubId = ref<string | null>(null);
const editClub = ref({
  name: '',
  tags: [] as string[],
  representativeEmail: ''
});

async function loadClubs() {
  // 実際の実装では、ClubServiceを拡張してClub一覧取得メソッドを追加する必要があります
  // 現在は既存のロジックを維持
  const { generateClient } = await import('aws-amplify/data');
  const client = generateClient();
  
  (client.models as any).Club.observeQuery({
    filter: { isActive: { eq: true } }
  }).subscribe({
    next: ({ items }: { items: any[] }) => {
      clubs.value = items.sort((a: any, b: any) => a.name.localeCompare(b.name));
    },
    error: (error: any) => {
      console.error('部活動データ取得エラー:', error);
    }
  });
}

async function loadTagCategories() {
  tagCategories.value = await UIService.getTagsByCategory();
}

function getTagsByCategory(category: string) {
  const categoryData = tagCategories.value.find(c => c.name === category);
  return categoryData ? categoryData.tags : [];
}

function toggleTag(tagName: string) {
  const index = newClub.value.tags.indexOf(tagName);
  if (index > -1) {
    newClub.value.tags.splice(index, 1);
  } else {
    if (newClub.value.tags.length >= 1) {
      UIService.showAlert('タグは最大1個まで選択できます');
      return;
    }
    newClub.value.tags.push(tagName);
  }
}

function toggleEditTag(tagName: string) {
  const index = editClub.value.tags.indexOf(tagName);
  if (index > -1) {
    editClub.value.tags.splice(index, 1);
  } else {
    if (editClub.value.tags.length >= 1) {
      UIService.showAlert('タグは最大1個まで選択できます');
      return;
    }
    editClub.value.tags.push(tagName);
  }
}

async function createClub() {
  if (!UIService.validateRequired(newClub.value.name)) {
    UIService.showAlert('部活動名は必須です');
    return;
  }
  
  if (newClub.value.tags.length === 0) {
    UIService.showAlert('タグを少なくとも1つ選択してください');
    return;
  }
  
  if (!UIService.validateRequired(newClub.value.representativeEmail)) {
    UIService.showAlert('代表者メールアドレスは必須です');
    return;
  }
  
  if (!UIService.validateEmail(newClub.value.representativeEmail)) {
    UIService.showAlert('有効なメールアドレスを入力してください');
    return;
  }
  
  try {
    const { generateClient } = await import('aws-amplify/data');
    const { generateClubId } = await import('../../utils/idGenerator');
    const client = generateClient();
    
    const customId = await generateClubId();
    await (client.models as any).Club.create({
      id: customId!,
      name: newClub.value.name,
      category: newClub.value.tags.join(', '),
      representativeEmail: newClub.value.representativeEmail,
      createdBy: (props.user.username || props.user.userId || props.user.sub || 'anonymous') as string
    });
    
    showCreateModal.value = false;
    resetNewClub();
    await loadClubs();
  } catch (error) {
    console.error('部活動作成エラー:', error);
    UIService.showAlert('部活動作成に失敗しました');
  }
}

function showWikiPage(clubId: string) {
  emit('showWiki', clubId);
}

function isClubOwner(club: any) {
  const currentUser = props.user.username || props.user.userId || props.user.sub || 'anonymous';
  return club.createdBy === currentUser;
}

function startEditClub(club: any, clickEvent: any) {
  clickEvent.stopPropagation();
  editingClubId.value = club.id;
  selectedEditCategory.value = '';
  editClub.value = {
    name: club.name || '',
    tags: club.category ? club.category.split(', ') : [],
    representativeEmail: club.representativeEmail || ''
  };
}

async function updateClub() {
  if (!UIService.validateRequired(editClub.value.name)) {
    UIService.showAlert('部活動名は必須です');
    return;
  }
  
  try {
    const { generateClient } = await import('aws-amplify/data');
    const client = generateClient();
    
    await (client.models as any).Club.update({
      id: editingClubId.value!,
      name: editClub.value.name,
      category: editClub.value.tags.join(', '),
      representativeEmail: editClub.value.representativeEmail
    });
    
    cancelEdit();
    await loadClubs();
  } catch (error) {
    console.error('部活動更新エラー:', error);
    UIService.showAlert('部活動更新に失敗しました');
  }
}

function cancelEdit() {
  editingClubId.value = null;
  selectedEditCategory.value = '';
  resetEditClub();
}

function resetNewClub() {
  newClub.value = { name: '', tags: [], representativeEmail: '' };
  selectedCategory.value = '';
}

function resetEditClub() {
  editClub.value = { name: '', tags: [], representativeEmail: '' };
}

function showParticipantsList(club: any, clickEvent: any) {
  clickEvent.stopPropagation();
  emit('showParticipants', club.id, club.name);
}

async function deleteClub(club: any, clickEvent: any) {
  clickEvent.stopPropagation();
  
  if (!isClubOwner(club)) {
    UIService.showAlert('自分が作成した部活動のみ削除できます');
    return;
  }
  
  if (UIService.showConfirm(`「${club.name}」を削除しますか？`)) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      
      await (client.models as any).Club.delete({ id: club.id });
      await loadClubs();
    } catch (error) {
      console.error('部活動削除エラー:', error);
      UIService.showAlert('部活動削除に失敗しました');
    }
  }
}

onMounted(() => {
  loadClubs();
  loadTagCategories();
});
</script>

<template>
  <div style="height: 100vh; overflow-y: auto; padding: 1rem; box-sizing: border-box;">
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
      <BaseButton variant="primary" size="small" @click="emit('back')">
        ← 戻る
      </BaseButton>
      
      <div style="flex: 1;"></div>
      
      <BaseButton variant="warning" @click="showCreateModal = true">
        部活動作成
      </BaseButton>
    </div>

    <div v-if="editingClubId" class="card" style="margin-bottom: 1rem;">
      <h3>部活動編集</h3>
      <div class="form-container">
        <BaseInput v-model="editClub.name" label="部活動名" required />
        <BaseInput v-model="editClub.representativeEmail" label="代表者メールアドレス" type="email" />
        
        <div class="form-group">
          <label>カテゴリ選択</label>
          <select v-model="selectedEditCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px;">
            <option value="">カテゴリを選択してください</option>
            <option v-for="category in tagCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
        
        <div v-if="selectedEditCategory" class="form-group">
          <label>タグ選択 (最大1個)</label>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
            <div v-for="tag in getTagsByCategory(selectedEditCategory)" :key="tag" style="margin-bottom: 0.5rem;">
              <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                <input type="checkbox" 
                       :checked="editClub.tags.includes(tag)" 
                       @change="toggleEditTag(tag)" 
                       style="margin-right: 0.5rem; width: auto;" />
                <span>{{ tag }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>選択済みタグ</label>
          <div v-if="editClub.tags.length" style="margin-top: 0.5rem;">
            <BaseTag v-for="(tag, index) in editClub.tags" :key="index" 
                     :text="tag" variant="success" size="small" removable
                     @remove="toggleEditTag(tag)"
                     style="margin-right: 0.5rem; margin-bottom: 0.5rem;" />
          </div>
          <div v-else style="color: #666; font-size: 0.9rem;">
            タグを選択してください
          </div>
        </div>
        
        <div class="form-group">
          <div style="display: flex; gap: 1rem;">
            <BaseButton variant="success" @click="updateClub">更新</BaseButton>
            <BaseButton variant="secondary" @click="cancelEdit">キャンセル</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!editingClubId" class="clubs-list" style="display: flex; flex-direction: column; gap: 1rem; max-height: 70vh; overflow-y: auto; padding-bottom: 4rem;">
      <BaseCard v-for="club in clubs" :key="club.id" 
                @click="showWikiPage(club.id)"
                style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; padding: 0.75rem; position: relative;"
                @mouseover="($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'"
                @mouseout="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'">
        
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h3 style="margin: 0; color: #333; font-size: 1.1rem;">{{ club.name }}</h3>
          
          <div v-if="club.category" style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
            <BaseTag v-for="tag in club.category.split(', ')" :key="tag"
                     :text="tag" variant="info" size="small" />
          </div>
          
          <div style="margin-left: auto; display: flex; gap: 0.25rem;" v-if="isClubOwner(club)">
            <BaseButton variant="info" size="small" @click="showParticipantsList(club, $event)">
              申請者一覧
            </BaseButton>
            <BaseButton variant="success" size="small" @click="startEditClub(club, $event)">
              編集
            </BaseButton>
            <BaseButton variant="danger" size="small" @click="deleteClub(club, $event)">
              削除
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-if="clubs.length === 0" style="text-align: center; padding: 2rem; color: #666;">
      <p>まだ部活動が登録されていません</p>
      <p>新規作成ボタンから部活動を追加してください</p>
    </div>

    <!-- 新規作成モーダル -->
    <BaseModal v-model:show="showCreateModal" title="新規部活動作成" size="large">
      <div class="form-container">
        <BaseInput v-model="newClub.name" label="部活動名" required />
        <BaseInput v-model="newClub.representativeEmail" label="代表者メールアドレス" type="email" required />

        <div class="form-group">
          <label>カテゴリ選択</label>
          <select v-model="selectedCategory" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px;">
            <option value="">カテゴリを選択してください</option>
            <option v-for="category in tagCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
        
        <div v-if="selectedCategory" class="form-group">
          <label>タグ選択 * (最大1個)</label>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 0.5rem; background: rgba(255, 255, 255, 0.9);">
            <div v-for="tag in getTagsByCategory(selectedCategory)" :key="tag" style="margin-bottom: 0.5rem;">
              <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                <input type="checkbox" 
                       :checked="newClub.tags.includes(tag)" 
                       @change="toggleTag(tag)" 
                       style="margin-right: 0.5rem; width: auto;" />
                <span>{{ tag }}</span>
              </label>
            </div>
          </div>
          
          <div v-if="newClub.tags.length" style="margin-top: 0.5rem;">
            <BaseTag v-for="(tag, index) in newClub.tags" :key="index" 
                     :text="tag" variant="success" size="small" removable
                     @remove="toggleTag(tag)"
                     style="margin-right: 0.5rem; margin-bottom: 0.5rem;" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <BaseButton variant="success" @click="createClub">作成</BaseButton>
        <BaseButton variant="secondary" @click="showCreateModal = false">キャンセル</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>