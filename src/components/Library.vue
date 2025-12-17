<template>
  <div>
    <h1>Сохраненные палитры</h1>
    <div v-if="palettes.length === 0">
      <p>Нет сохраненных палитр.</p>
    </div>
    <div v-else class="palettes-grid">
      <div v-for="p in palettes" :key="p.id" class="palette-item" @click="selectPalette(p)">
        <div class="palette-colors">
          <div
            v-for="(color, index) in p.colors"
            :key="index"
            class="palette-color"
            :style="{ backgroundColor: color }"
          ></div>
        </div>
        <button @click.stop="deletePalette(p.id)">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const palettes = ref([]);
const router = useRouter();

const loadPalettes = () => {
  palettes.value = JSON.parse(localStorage.getItem('savedPalettes') || '[]').sort((a, b) => b.id - a.id);
};

const deletePalette = (id) => {
  const updatedPalettes = palettes.value.filter(p => p.id !== id);
  localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes));
  palettes.value = updatedPalettes;
};

const selectPalette = (palette) => {
  router.push({ path: '/', query: { palette: JSON.stringify(palette.colors) } });
};

onMounted(loadPalettes);
</script>

<style scoped>
.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.palette-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
}

.palette-colors {
  display: flex;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.palette-color {
  flex: 1;
}
</style>