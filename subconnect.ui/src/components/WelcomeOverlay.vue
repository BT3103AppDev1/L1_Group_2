<template>
  <Transition name="fade">
    <div v-if="isVisible" class="welcome-overlay">
      <div class="welcome-content">
        <div class="logo-pulse">
          <img src="@/assets/subconnect-logo.png" alt="SubConnect" class="pulse-img" />
        </div>
        <h2 class="welcome-text">Welcome back!</h2>
        <p class="welcome-subtext">Preparing your dashboard...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const isVisible = ref(false);
const route = useRoute();

watch(() => route.fullPath, () => {
  if (sessionStorage.getItem('showWelcomeAnimation') === 'true') {
    isVisible.value = true;
    
    sessionStorage.removeItem('showWelcomeAnimation');

    setTimeout(() => {
      isVisible.value = false;
    }, 1500);
  }
}, { immediate: true });
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.logo-pulse {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem auto;
  background: white;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 10px 25px rgba(108, 71, 255, 0.2);
  animation: pulse 1.5s infinite alternate;
}

.pulse-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.welcome-text {
  font-size: 2rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.welcome-subtext {
  color: #6b7080;
  font-size: 1.1rem;
}

@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 10px 25px rgba(108, 71, 255, 0.1); }
  100% { transform: scale(1.05); box-shadow: 0 15px 35px rgba(108, 71, 255, 0.3); }
}

.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>