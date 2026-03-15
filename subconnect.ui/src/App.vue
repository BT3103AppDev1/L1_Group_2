<template>
  <Navbar />
  
  <main class="app-wrapper">
    <router-view></router-view> 
  </main>
</template>

<script setup>
// Import our new smart Navbar!
import Navbar from './components/Navbar.vue';
</script>

<style>
/* Global reset to remove default browser margins */
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa; /* Gives the whole app a nice soft gray background */
}

.app-wrapper {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px; /* Space between the navbar and the content */
}
</style>