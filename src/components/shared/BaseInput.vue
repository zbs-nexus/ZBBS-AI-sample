<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    
    <input
      v-if="type !== 'textarea'"
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClass"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    />
    
    <textarea
      v-else
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="inputClass"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    ></textarea>
    
    <div v-if="errorMessage" class="base-input__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  rows: 3
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  focus: [];
}>();

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`);

const inputClass = computed(() => {
  const classes = ['base-input__field'];
  if (props.errorMessage) classes.push('base-input__field--error');
  if (props.disabled) classes.push('base-input__field--disabled');
  return classes.join(' ');
});

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const onBlur = () => {
  emit('blur');
};

const onFocus = () => {
  emit('focus');
};
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.base-input__label {
  font-weight: bold;
  color: var(--primary-color, #333);
  font-size: 0.9rem;
}

.base-input__required {
  color: var(--danger-color, #dc3545);
}

.base-input__field {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius, 6px);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.base-input__field:focus {
  outline: none;
  border-color: var(--info-color, #17a2b8);
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.2);
}

.base-input__field--error {
  border-color: var(--danger-color, #dc3545);
}

.base-input__field--error:focus {
  border-color: var(--danger-color, #dc3545);
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.base-input__field--disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.base-input__error {
  color: var(--danger-color, #dc3545);
  font-size: 0.8rem;
}

textarea.base-input__field {
  resize: vertical;
  min-height: 80px;
}
</style>