<template>
  <div class="dashboard-container">
    <h2>Welcome to your Dashboard! </h2>
    <p>You have successfully logged in.</p>
    
    <div class="placeholder-box">
      <p>(charts and come here)</p>
    </div>

    <button @click="handleLogout" class="logout-btn">Log Out</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { logoutUser } from '../services/auth.js'; 

const router = useRouter();

const handleLogout = async () => {
  try {
    console.log("Attempting to log out...");
    await logoutUser(); 
    router.push('/login'); 
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  text-align: center;
}

.placeholder-box {
  width: 100%;
  max-width: 600px;
  height: 200px;
  background-color: #f8f9fa;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  color: #6c757d;
  border-radius: 8px;
}

.logout-btn {
  padding: 0.5rem 1.5rem;
  background-color: #dc3545; /* Red for logout */
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>