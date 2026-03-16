
<template>
  <WelcomeOverlay />
  <TheHeader v-if="!isAuthRoute" />

  <main class="app-wrapper" :class="{ 'app-wrapper--auth': isAuthRoute }">
    <router-view />
  </main>

  <TheFooter v-if="!isAuthRoute" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import WelcomeOverlay from './components/WelcomeOverlay.vue';

const route = useRoute();

// Hide header/footer on login and register pages
const isAuthRoute = computed(() => {
  return route.meta?.layout === 'auth';
});
</script>

<style>
/* Global reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* App shell */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main content area */
.app-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Auth pages (login/register) keep original centered layout */
.app-wrapper--auth {
  align-items: center;
  justify-content: center;
}
</style>