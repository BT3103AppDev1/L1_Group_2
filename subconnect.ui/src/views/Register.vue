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
        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            class="toggle-password-btn"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        
        <div v-if="password" class="strength-meter">
          <div class="strength-bar-bg">
            <div 
              class="strength-bar-fill" 
              :style="{ width: `${(passwordScore / 4) * 100}%`, backgroundColor: strengthColor }"
            ></div>
          </div>
          <div class="strength-label" :style="{ color: strengthColor }">
            {{ strengthText }}
          </div>
        </div>
      </div>

      <button type="submit" class="signup-btn" :disabled="passwordScore < 3">Sign Up</button>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </form>

    <p class="toggle-text">
      Already have an account?
      <router-link to="/login" class="toggle-link">Log in here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/auth.js';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const router = useRouter();

// NEW: Password Strength Logic
const passwordScore = computed(() => {
  if (!password.value) return 0;
  let score = 0;
  
  // Criteria 1: At least 8 characters
  if (password.value.length >= 8) score += 1;
  // Criteria 2: Contains an uppercase letter
  if (/[A-Z]/.test(password.value)) score += 1;
  // Criteria 3: Contains a number
  if (/[0-9]/.test(password.value)) score += 1;
  // Criteria 4: Contains a special character
  if (/[^A-Za-z0-9]/.test(password.value)) score += 1;
  
  return score;
});

const strengthText = computed(() => {
  switch (passwordScore.value) {
    case 1: return 'Weak (Add numbers & special characters)';
    case 2: return 'Fair (Getting better)';
    case 3: return 'Good (Almost there)';
    case 4: return 'Strong (Excellent)';
    default: return 'Enter a password';
  }
});

const strengthColor = computed(() => {
  switch (passwordScore.value) {
    case 1: return '#dc3545'; // Red
    case 2: return '#ffc107'; // Yellow
    case 3: return '#17a2b8'; // Blue
    case 4: return '#28a745'; // Green
    default: return '#e9ecef'; // Gray
  }
});

const handleRegister = async () => {
  // Extra safety check before sending to Firebase
  if (passwordScore.value < 3) {
    errorMessage.value = 'Please create a stronger password before signing up.';
    return;
  }

  try {
    errorMessage.value = '';
    console.log('Attempting to register...');

    await registerUser(email.value, password.value);

    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value =
      'Error creating account. Email may already be in use.';
  }
};
</script>

<style scoped>
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

.logo-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  display: block;
}

.register-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

form {
  padding: 2rem 2rem 0 2rem;
}

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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  margin-top: 0.25rem;
  width: auto;
  padding: 0;
  background: none;
  color: #6b7080;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password-btn:hover {
  background: none;
  color: #1a1a2e;
}

/* NEW: Password Strength Meter Styles */
.strength-meter {
  margin-top: 0.75rem;
}

.strength-bar-bg {
  height: 6px;
  width: 100%;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: right;
  transition: color 0.3s ease;
}

.signup-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s, opacity 0.2s;
}

.signup-btn:hover:not(:disabled) {
  background-color: #218838;
}

.signup-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
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