<script setup>
// This imports the form component you built
import AddSubscription from './components/AddSubscription.vue';
</script>

<template>
  <main class="dashboard-container">
    <h1>SubConnect Dummy Test</h1>
    
    <AddSubscription />
  </main>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  padding: 40px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>