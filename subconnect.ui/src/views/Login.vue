<template>
  <div class="split-layout">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Take control of your subscriptions.</h1>
        <p class="hero-subtitle">
          Consolidate, track, and save on your monthly spending with
          SubConnect's powerful analytics dashboard.
        </p>
      </div>

      <div class="team-credits">
        <p>
          Built by <span class="team-name">Abi, Wei Young</span>,
          <span class="team-name">Jun Jie</span> &
          <span class="team-name">Kiahna</span>
        </p>
      </div>
    </div>

    <div class="auth-section">
      <div class="auth-container">
        <div class="logo-container">
          <img
            src="../assets/subconnect-logo.png"
            alt="SubConnect Logo"
            class="login-logo"
          />
        </div>

        <form @submit.prevent="handleLogin">
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

          <button type="submit">Log In</button>

          <div class="divider">
            <span>OR</span>
          </div>

          <button type="button" class="google-btn" @click="handleGoogleLogin">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              class="google-icon"
            />
            Sign in with Google
          </button>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </form>

        <p class="toggle-text">
          Don't have an account?
          <router-link to="/register" class="toggle-link"
            >Register here</router-link
          >
        </p>
      </div>
    </div>
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
    await loginUser(email.value, password.value);
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Invalid email or password. Please try again.';
  }
};

const handleGoogleLogin = async () => {
  try {
    errorMessage.value = '';
    await loginWithGoogle();
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Google sign-in failed or was cancelled.';
  }
};
</script>

<style scoped>
/* --- split screen --- */
.split-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: -40px 0 0 0;
}

/* --- left section --- */
.hero-section {
  flex: 1;
  background: linear-gradient(135deg, #4a148c 0%, #311b92 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  position: relative;
}

.hero-content {
  max-width: 500px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.9;
}

/* --- team credits --- */
.team-credits {
  position: absolute;
  bottom: 2rem;
  left: 4rem;
  font-size: 0.85rem;
  opacity: 0; /* Start completely invisible */
  letter-spacing: 0.5px;
  /* Run the entrance animation: 1 second long, smooth curve, stay visible at the end */
  animation: fadeSlideUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
}

/* The Entrance Animation */
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(15px); /* Start slightly lower down */
  }
  100% {
    opacity: 0.6; /* Fade in to 60% opacity so it stays subtle */
    transform: translateY(0); /* Lock into its final resting place */
  }
}

/* The Hover Glow on the Names */
.team-name {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease; /* Makes the transition smooth instead of instant */
  cursor: default;
}

.team-name:hover {
  color: #ffffff; /* Turns pure white */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); /* Adds a futuristic glow */
  opacity: 1;
}

/* --- right ssection --- */
.auth-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
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
.login-logo {
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
.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #ddd;
}
.divider::before {
  left: 0;
}
.divider::after {
  right: 0;
}
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
