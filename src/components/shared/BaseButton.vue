<template>
  <button 
    :class="buttonClass"
    :style="buttonStyle"
    :disabled="disabled"
    @click="$emit('click')"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false
});

defineEmits<{
  click: [];
}>();

const isHovered = ref(false);

const buttonClass = computed(() => {
  const classes = ['base-button'];
  classes.push(`base-button--${props.variant}`);
  classes.push(`base-button--${props.size}`);
  if (props.disabled) classes.push('base-button--disabled');
  return classes.join(' ');
});

const buttonStyle = computed(() => {
  const baseStyle = {
    padding: props.size === 'small' ? '0.3rem 0.6rem' : '0.5rem 1rem',
    fontSize: props.size === 'small' ? '0.8rem' : '1rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '6px',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const variantStyles = {
    primary: {
      background: isHovered.value ? '#f8f9fa' : '#ffffff',
      color: '#333333',
      borderColor: '#333333'
    },
    secondary: {
      background: '#6c757d',
      color: 'white',
      borderColor: '#6c757d'
    },
    success: {
      background: '#28a745',
      color: 'white',
      borderColor: '#28a745'
    },
    danger: {
      background: '#dc3545',
      color: 'white',
      borderColor: '#dc3545'
    },
    info: {
      background: '#17a2b8',
      color: 'white',
      borderColor: '#17a2b8'
    },
    warning: {
      background: '#ff8c00',
      color: 'white',
      borderColor: '#ff8c00'
    }
  };

  return {
    ...baseStyle,
    ...variantStyles[props.variant]
  };
});

const onMouseOver = () => {
  if (!props.disabled) {
    isHovered.value = true;
  }
};

const onMouseOut = () => {
  isHovered.value = false;
};
</script>

<style scoped>
.base-button {
  outline: none;
}

.base-button--disabled {
  opacity: 0.6;
}
</style>