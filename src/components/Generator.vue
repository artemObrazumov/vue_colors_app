<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import tinycolor from 'tinycolor2';
import { useRoute, useRouter } from 'vue-router';
import Export from './Export.vue';
import ContrastChecker from './ContrastChecker.vue';

const baseColor = ref('#000000');
const palette = ref([]);
const colorCount = ref(5);
const colorFormat = ref('hex');
const lockedColors = ref([]);
const notification = ref('');
const previewTheme = ref('light');
const paletteType = ref('analogous');
const showExportModal = ref(false);

const generatePalette = (type = paletteType.value) => {
  paletteType.value = type;
  const newPalette = [];
  const color = tinycolor(baseColor.value);

  switch (type) {
    case 'analogous':
      newPalette.push(...color.analogous(colorCount.value).map(c => c.toHexString()));
      break;
    case 'monochromatic':
      newPalette.push(...color.monochromatic(colorCount.value).map(c => c.toHexString()));
      break;
    case 'triad':
      newPalette.push(...color.triad().map(c => c.toHexString()));
      break;
    case 'complement':
      newPalette.push(color.toHexString(), color.complement().toHexString());
      break;
  }

  if (['triad', 'complement'].includes(type)) {
    palette.value = newPalette;
    colorCount.value = newPalette.length;
  } else {
    palette.value = newPalette.slice(0, colorCount.value);
  }
};

const disableColorCount = computed(() => {
    return ['triad', 'complement'].includes(paletteType.value);
});


const copyToClipboard = (color) => {
  const valueToCopy = colorFormat.value === 'rgb' ? tinycolor(color).toRgbString() : color;
  navigator.clipboard.writeText(valueToCopy).then(() => {
    notification.value = `Скопировано ${valueToCopy}!`;
    setTimeout(() => {
      notification.value = '';
    }, 2000);
  });
};

const toggleLock = (index) => {
  lockedColors.value[index] = !lockedColors.value[index];
};

const formattedPalette = computed(() => {
  return palette.value.map(color => {
    return colorFormat.value === 'rgb' ? tinycolor(color).toRgbString() : color;
  });
});

const savePalette = () => {
  const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
  savedPalettes.push({id: Date.now(), colors: palette.value});
  localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
  notification.value = 'Палитра сохранена!';
  setTimeout(() => {
      notification.value = '';
    }, 2000);
};

watch(colorCount, (newCount) => {
    if(!disableColorCount.value){
        generatePalette();
    }
});

watch(baseColor, () => {
    generatePalette();
})

const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (route.query.palette) {
    try {
      const colors = JSON.parse(route.query.palette);
      palette.value = colors;
      colorCount.value = colors.length;
      // Clean the query parameter
      router.replace({ query: {} });
    } catch (e) {
      console.error('Failed to parse palette from query:', e);
      generatePalette();
    }
  } else {
    generatePalette();
  }
});
</script>

<template>
  <div id="app-container" :class="previewTheme">
    <header>
      <h1>Генератор палитры</h1>
      <div class="controls">
        <div>
            <span>Базовый цвет:</span>
            <input type="color" v-model="baseColor" @input="generatePalette()">
        </div>
        <button @click="generatePalette('analogous')">Аналогичная</button>
        <button @click="generatePalette('monochromatic')">Монохромная</button>
        <button @click="generatePalette('triad')">Триада</button>
        <button @click="generatePalette('complement')">Комплементарная</button>
        <div :style="{ opacity: disableColorCount ? 0.5 : 1 }">
          <span>Количество:</span>
          <label><input type="radio" v-model="colorCount" :value="3" :disabled="disableColorCount" /> 3</label>
          <label><input type="radio" v-model="colorCount" :value="5" :disabled="disableColorCount" /> 5</label>
          <label><input type="radio" v-model="colorCount" :value="7" :disabled="disableColorCount" /> 7</label>
        </div>
        <div>
          <span>Формат:</span>
          <label><input type="radio" v-model="colorFormat" value="hex" /> HEX</label>
          <label><input type="radio" v-model="colorFormat" value="rgb" /> RGB</label>
        </div>
      </div>
    </header>

    <main>
      <div class="palette">
        <div
          v-for="(color, index) in palette"
          :key="index"
          class="color-card"
          :style="{ backgroundColor: color }"
          @click="copyToClipboard(color)"
        >
          <span class="color-value">{{ formattedPalette[index] }}</span>
          <button class="lock-btn" @click.stop="toggleLock(index)">
            {{ lockedColors[index] ? 'Открепить' : 'Закрепить' }}
          </button>
        </div>
      </div>
       <button @click="savePalette">Сохранить палитру</button>
       <button @click="showExportModal = true">Экспорт</button>
    </main>

    <div class="notification" v-if="notification">{{ notification }}</div>

    <section class="preview-section">
      <h2>Предпросмотр</h2>
      <div class="preview-controls">
        <span>Тема:</span>
        <label><input type="radio" v-model="previewTheme" value="light" /> Светлая</label>
        <label><input type="radio" v-model="previewTheme" value="dark" /> Темная</label>
      </div>
      <div class="preview-content">
        <h3 :style="{ color: palette[0] }">Заголовок</h3>
        <p :style="{ color: palette[1] }">Текст</p>
        <div class="preview-card" :style="{ backgroundColor: palette[2], borderColor: palette[3] }">
          <p :style="{ color: palette[4] }">Абзац с фоном</p>
        </div>
        <button class="preview-button" :style="{ backgroundColor: palette[4], color: palette[0] }">
          Кнопка
        </button>
      </div>
      <ContrastChecker :palette="palette" />
    </section>

    <Export v-if="showExportModal" :palette="palette" @close="showExportModal = false" />
  </div>
</template>
<style>
:root {
  --bg-light: #f4f4f4;
  --text-light: #333;
  --bg-dark: #222;
  --text-dark: #eee;
}

body {
  font-family: sans-serif;
  margin: 0;
  transition: background-color 0.3s, color 0.3s;
}

* {
  box-sizing: border-box;
}

#app-container {
  padding: 20px;
  min-height: 100vh;
}
#app-container.light {
  background-color: var(--bg-light);
  color: var(--text-light);
}
#app-container.dark {
  background-color: var(--bg-dark);
  color: var(--text-dark);
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.controls div {
  display: flex;
  gap: 1rem;
  align-items: center;
}
label {
  cursor: pointer;
}

.palette {
  display: flex;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.color-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  color: white;
  cursor: pointer;
  transition: flex-grow 0.2s;
  position: relative;
}
.color-card:hover {
  flex-grow: 1.2;
}

.color-value {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  text-align: center;
}

.lock-btn {
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  border-radius: 8px;
  height: 30px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.color-card:hover .lock-btn {
  opacity: 1;
}

.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 100;
}

.preview-section {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}
#app-container.dark .preview-section {
  border-color: #555;
}

.preview-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-content {
  padding: 1rem;
  border-radius: 4px;
}

.preview-card {
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid;
  border-radius: 4px;
}

.preview-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

</style>