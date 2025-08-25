<template>
  <Teleport to="body">
    <div v-if="show" class="base-modal" @click="onBackdropClick">
      <div class="base-modal__dialog" :class="sizeClass" @click.stop>
        <div class="base-modal__header" v-if="$slots.header || title">
          <slot name="header">
            <h3 class="base-modal__title">{{ title }}</h3>
          </slot>
          <button 
            v-if="closable"
            class="base-modal__close"
            @click="close"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        
        <div class="base-modal__body">
          <slot />
        </div>
        
        <div class="base-modal__footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closable: true,
  closeOnBackdrop: true
});

const emit = defineEmits<{
  close: [];
  'update:show': [value: boolean];
}>();

const sizeClass = computed(() => {
  return `base-modal__dialog--${props.size}`;
});

const close = () => {
  emit('close');
  emit('update:show', false);
};

const onBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};

// ESCキーでモーダルを閉じる
watch(() => props.show, (newShow) => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.closable) {
      close();
    }
  };

  if (newShow) {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  box-sizing: border-box;
}

.base-modal__dialog {
  background: white;
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--box-shadow-large, 0 2px 8px rgba(0, 0, 0, 0.1));
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.base-modal__dialog--small {
  width: 100%;
  max-width: 400px;
}

.base-modal__dialog--medium {
  width: 100%;
  max-width: 600px;
}

.base-modal__dialog--large {
  width: 100%;
  max-width: 800px;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.base-modal__title {
  margin: 0;
  color: var(--primary-color, #333);
}

.base-modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.base-modal__close:hover {
  background-color: #f0f0f0;
}

.base-modal__body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

.base-modal__footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .base-modal {
    padding: 0.5rem;
  }
  
  .base-modal__dialog {
    max-height: 95vh;
  }
  
  .base-modal__header,
  .base-modal__body,
  .base-modal__footer {
    padding: 0.75rem;
  }
}
</style>