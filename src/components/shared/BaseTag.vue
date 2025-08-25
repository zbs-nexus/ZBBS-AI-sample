<template>
  <span 
    :class="tagClass"
    :style="tagStyle"
    @click="onClick"
  >
    <slot>{{ text }}</slot>
    <button 
      v-if="removable" 
      class="base-tag__remove"
      @click.stop="onRemove"
      aria-label="削除"
    >
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UIService } from '../../services/uiService';

interface Props {
  text?: string;
  category?: string;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  removable?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium',
  clickable: false,
  removable: false,
  selected: false
});

const emit = defineEmits<{
  click: [];
  remove: [];
}>();

const tagClass = computed(() => {
  const classes = ['base-tag'];
  classes.push(`base-tag--${props.variant}`);
  classes.push(`base-tag--${props.size}`);
  if (props.clickable) classes.push('base-tag--clickable');
  if (props.selected) classes.push('base-tag--selected');
  return classes.join(' ');
});

const tagStyle = computed(() => {
  if (props.category && props.variant === 'default') {
    return {
      backgroundColor: UIService.getTagColor(props.category),
      color: UIService.getTagTextColor(props.category)
    };
  }
  return {};
});

const onClick = () => {
  if (props.clickable) {
    emit('click');
  }
};

const onRemove = () => {
  emit('remove');
};
</script>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.base-tag--small {
  padding: 0.1rem 0.3rem;
  font-size: 0.7rem;
}

.base-tag--medium {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
}

.base-tag--large {
  padding: 0.3rem 0.7rem;
  font-size: 0.9rem;
}

.base-tag--clickable {
  cursor: pointer;
}

.base-tag--clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.base-tag--selected {
  border-color: var(--primary-color, #333);
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.2);
}

/* バリアント別スタイル */
.base-tag--default {
  background-color: #f5f5f5;
  color: #666;
}

.base-tag--primary {
  background-color: var(--primary-color, #333);
  color: white;
}

.base-tag--success {
  background-color: var(--success-color, #28a745);
  color: white;
}

.base-tag--danger {
  background-color: var(--danger-color, #dc3545);
  color: white;
}

.base-tag--warning {
  background-color: var(--warning-color, #ffc107);
  color: #333;
}

.base-tag--info {
  background-color: var(--info-color, #17a2b8);
  color: white;
}

.base-tag__remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1em;
  padding: 0;
  margin-left: 0.2rem;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.base-tag__remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.base-tag--primary .base-tag__remove:hover,
.base-tag--success .base-tag__remove:hover,
.base-tag--danger .base-tag__remove:hover,
.base-tag--info .base-tag__remove:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>