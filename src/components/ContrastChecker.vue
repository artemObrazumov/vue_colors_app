<template>
  <div class="contrast-checker">
    <h3>Проверка контрастности (WCAG)</h3>
    <table>
      <thead>
        <tr>
          <th></th>
          <th v-for="(color, index) in palette" :key="index" :style="{ backgroundColor: color }"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(c1, i) in palette" :key="i">
          <td :style="{ backgroundColor: c1 }"></td>
          <td v-for="(c2, j) in palette" :key="j" :style="{ backgroundColor: c1, color: c2 }">
            <div v-if="i !== j">
              <strong>{{ tinycolor.readability(c1, c2).toFixed(2) }}</strong>
              <small>{{ getLevel(tinycolor.readability(c1, c2)) }}</small>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="accent-picker">
        <h3>Подбор акцентных цветов</h3>
        <div class="accent-grid">
            <div v-for="(color, i) in palette" :key="i" class="accent-item" :style="{backgroundColor: color}">
                <p :style="{color: findBestAccent(color, palette)}">
                    Акцентный цвет
                </p>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import tinycolor from 'tinycolor2';

const props = defineProps({
  palette: Array,
});

const getLevel = (ratio) => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
};

const findBestAccent = (background, palette) => {
    let bestColor = null;
    let maxRatio = 0;
    for(const color of palette) {
        if(color === background) continue;
        const ratio = tinycolor.readability(background, color);
        if(ratio > maxRatio) {
            maxRatio = ratio;
            bestColor = color;
        }
    }
    return bestColor;
}
</script>

<style scoped>
.contrast-checker {
  margin-top: 2rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: center;
  height: 50px;
}
th {
  width: 50px;
}
td div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.accent-picker {
    margin-top: 2rem;
}
.accent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}
.accent-item {
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}
</style>