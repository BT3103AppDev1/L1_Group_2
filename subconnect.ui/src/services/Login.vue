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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { loginUser } from '../services/auth.js'; // Importing your custom auth logic!

// Reactive variables to hold what the user types
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  try {
    errorMessage.value = ''; // Clear any old errors
    console.log("Attempting to log in...");
    
    // Call your function from auth.js
    const user = await loginUser(email.value, password.value);
    
    alert(`Success! Logged in as: ${user.email}`);
    // NOTE: Later, we will use Vue Router to redirect them to the Dashboard here!
    
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
</style>