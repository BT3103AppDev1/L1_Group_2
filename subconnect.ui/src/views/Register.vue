<template>
  <div class="auth-container">
    <h2>Create an Account</h2>
    
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" required />
      </div>

      <button type="submit">Sign Up</button>
      
      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </form>

    <p class="toggle-text">
      Already have an account? 
      <router-link to="/login" class="toggle-link">Log in here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // 1. Import the router tool
import { registerUser } from '../services/auth.js'; 

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter(); // 2. Turn on the router for this component

const handleRegister = async () => {
  try {
    errorMessage.value = ''; 
    console.log("Attempting to register...");
    
    await registerUser(email.value, password.value);
    
    router.push('/dashboard');
    
  } catch (error) {
    console.error(error);
    errorMessage.value = "Error creating account. Password must be at least 6 characters, or email is already in use.";
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
  background-color: #28a745; /* Green button to differentiate sign up */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #218838;
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