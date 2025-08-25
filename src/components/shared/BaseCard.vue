<template>
  <div :class="cardClass" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  rounded?: boolean;
  shadow?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  rounded: true,
  shadow: true,
  padding: 'medium'
});

const cardClass = computed(() => {
  const classes = ['base-card'];
  if (props.rounded) classes.push('base-card--rounded');
  if (props.shadow) classes.push('base-card--shadow');
  return classes.join(' ');
});

const cardStyle = computed(() => {
  const paddingMap = {
    none: '0',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem'
  };

  return {
    padding: paddingMap[props.padding],
    background: '#ffffff',
    border: '1px solid #e0e0e0'
  };
});
</script>

<style scoped>
.base-card {
  background: white;
}

.base-card--rounded {
  border-radius: 12px;
}

.base-card--shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>