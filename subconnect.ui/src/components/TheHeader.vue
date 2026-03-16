<template>
  <header class="app-header">
    <div class="header-inner">

      <router-link to="/dashboard" class="brand">
        <div class="brand-icon">
          <img src="@/assets/subconnect-logo.png" alt="SubConnect" class="brand-logo" />
        </div>
        <span class="brand-name">SubConnect</span>
      </router-link>

      <nav class="main-nav">
        <router-link to="/dashboard" class="nav-link" active-class="nav-link--active">
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="2" y="2" width="7" height="7" rx="1.5"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5"/>
          </svg>
          Dashboard
        </router-link>
        <router-link to="/comparison" class="nav-link" active-class="nav-link--active">
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
            <polyline points="2,14 7,8 12,11 18,4"/>
            <line x1="2" y1="17" x2="18" y2="17"/>
          </svg>
          Comparison
        </router-link>
        <router-link to="/alerts" class="nav-link" active-class="nav-link--active">
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6z"/>
            <path d="M8 16.5a2 2 0 0 0 4 0"/>
          </svg>
          Alerts
        </router-link>
      </nav>

      <div class="header-right">
        <button class="icon-btn" title="Notifications">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20">
            <path d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6z"/>
            <path d="M8 16.5a2 2 0 0 0 4 0"/>
          </svg>
        </button>
        
        <div class="user-info" v-if="userEmail">
          <span class="user-email-text">{{ userEmail }}</span>
        </div>
        
        <div class="avatar" :title="userEmail">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z"/>
          </svg>
        </div>

        <button @click="handleLogout" class="logout-btn">Log Out</button>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();
const userEmail = ref('');

// Listen to Firebase and update the email variable automatically
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email;
    } else {
      userEmail.value = '';
    }
  });
});

// The secure logout function
const handleLogout = async () => {
  try {
    console.log("Attempting to log out...");
    await signOut(auth);
    router.push('/login'); 
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e8e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 28px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: #6c47ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.02em;
}

/* ── Nav ── */
.main-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7080;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: #1a1a2e;
  background: #f4f4f8;
}

.nav-link--active {
  color: #6c47ff;
  background: #f0ecff;
  font-weight: 600;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Right side ── */
.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6b7080;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover {
  background: #f4f4f8;
  color: #1a1a2e;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e0d9ff;
  color: #6c47ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #6c47ff22;
}

/* ── Visible User Email ── */
.user-info {
  display: flex;
  align-items: center;
  margin-left: 8px;
  margin-right: 4px;
}

.user-email-text {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7080;
  letter-spacing: 0.2px;
}

/* ──  Logout Button ── */
.logout-btn {
  margin-left: 8px; 
  padding: 6px 14px;
  background-color: #fff1f1; 
  color: #dc3545; 
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background-color: #dc3545;
  color: #ffffff;
}
</style>