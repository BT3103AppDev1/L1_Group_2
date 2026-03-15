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

      <div class="divider">
        <span>OR</span>
      </div>

      <button type="button" class="google-btn" @click="handleGoogleLogin">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="google-icon" />
        Sign in with Google
      </button>
      
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
import { useRouter } from 'vue-router'; 
import { loginUser, loginWithGoogle } from '../services/auth.js'; 

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter(); 

const handleLogin = async () => {
  try {
    errorMessage.value = ''; 
    console.log("Attempting to log in...");
    
    await loginUser(email.value, password.value);
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value = "Invalid email or password. Please try again.";
  }
};

const handleGoogleLogin = async () => {
  try {
    errorMessage.value = '';
    console.log("Opening Google popup...");
    
    await loginWithGoogle();
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value = "Google sign-in failed or was cancelled.";
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

.divider {
  text-align: center;
  margin: 1.5rem 0;
  color: #888;
  font-size: 0.9rem;
  position: relative;
}

.divider::before, .divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #ddd;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.google-btn {
  background-color: white;
  color: #444;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-btn:hover {
  background-color: #f8f9fa;
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style>