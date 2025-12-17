import { createRouter, createWebHistory } from 'vue-router';
import Generator from './components/Generator.vue';
import Library from './components/Library.vue';

const routes = [
  { path: '/', component: Generator },
  { path: '/library', component: Library },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
