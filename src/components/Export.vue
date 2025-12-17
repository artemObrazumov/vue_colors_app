<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Экспорт палитры</h2>
      <div class="format-tabs">
        <button @click="format = 'css'" :class="{ active: format === 'css' }">CSS</button>
        <button @click="format = 'scss'" :class="{ active: format === 'scss' }">SCSS</button>
        <button @click="format = 'tailwind'" :class="{ active: format === 'tailwind' }">Tailwind</button>
      </div>
      <textarea readonly :value="exportedCode" rows="10"></textarea>
      <button @click="copyToClipboard">Скопировать</button>
      <button @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  palette: Array,
});

const format = ref('css');

const exportedCode = computed(() => {
  switch (format.value) {
    case 'css':
      return props.palette.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
    case 'scss':
      return props.palette.map((color, i) => `$color-${i + 1}: ${color};`).join('\n');
    case 'tailwind':
      return `module.exports = {
  theme: {
    extend: {
      colors: {
${props.palette.map((color, i) => `        'color-${i + 1}': '${color}',`).join('\n')}
      },
    },
  },
};
`;
    default:
      return '';
  }
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportedCode.value);
};

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  color: #000;
}

.format-tabs {
  margin-bottom: 1rem;
}

.format-tabs button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: pointer;
}

.format-tabs button.active {
  background: #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

textarea {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
