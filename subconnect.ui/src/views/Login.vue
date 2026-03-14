<template>
  <div class="auth-container">
    <h2>Login to SubConnect</h2>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" required />
      </div>

      <button type="submit">Log In</button>
      
      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </form>

    <p class="toggle-text">
      Don't have an account? 
      <router-link to="/register" class="toggle-link">Register here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // 1. Import the router tool
import { loginUser } from '../services/auth.js'; 

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter(); // 2. Turn on the router for this component

const handleLogin = async () => {
  try {
    errorMessage.value = ''; 
    console.log("Attempting to log in...");
    
    await loginUser(email.value, password.value);
    
    // 3. The Magic Redirect! Send them straight to the dashboard.
    router.push('/dashboard');
    
  } catch (error) {
    console.error(error);
    errorMessage.value = "Invalid email or password. Please try again.";
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

input {
  padding: 0.5rem;
  margin-top: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #0056b3;
}

.error-msg {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

/* Styles for the bottom link */
.toggle-text {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
}

.toggle-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-weight: bold;
}

.toggle-link:hover {
  color: #0056b3;
}
</style>