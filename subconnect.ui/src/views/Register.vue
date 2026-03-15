<template>
  <div class="auth-container">
    <div class="logo-container">
      <img
        src="../assets/subconnect-logo.png"
        alt="SubConnect Logo"
        class="register-logo"
      />
    </div>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" class="signup-btn">Sign Up</button>

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
import { useRouter } from 'vue-router';
import { registerUser } from '../services/auth.js';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleRegister = async () => {
  try {
    errorMessage.value = '';
    console.log('Attempting to register...');

    await registerUser(email.value, password.value);

    // Redirect
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value =
      'Error creating account. Password must be at least 6 characters, or email is already in use.';
  }
};
</script>

<style scoped>
/* Main container - perfectly matching the login page */
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Logo Wrapper */
.logo-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  display: block;
}

/* The Image Itself */
.register-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Internal form spacing */
form {
  padding: 2rem 2rem 0 2rem;
}

/* Bottom text spacing */
.toggle-text {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
  padding-bottom: 2rem;
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

/* Specific green styling for the Sign Up button */
.signup-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.signup-btn:hover {
  background-color: #218838;
}

.error-msg {
  color: red;
  margin-top: 1rem;
  text-align: center;
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
