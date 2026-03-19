<template>
  <header class="app-header">
    <div class="header-inner">

      <router-link to="/dashboard" class="brand">
        <img src="@/assets/subconnect-logo.png" alt="SubConnect" class="brand-logo" />
        <span><span class="brand-name">Sub</span><span class="brand-name-secondary">Connect</span></span>
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

        <!-- Avatar with dropdown -->
        <div class="avatar-wrapper" ref="avatarWrapper">
          <div class="avatar" @click="toggleDropdown">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z"/>
            </svg>
          </div>

          <div v-if="dropdownOpen" class="dropdown">
            <div class="dropdown-email">{{ userEmail }}</div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="dropdownOpen = false">Profile</button>
            <button class="dropdown-item" @click="dropdownOpen = false">Settings</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-item--danger" @click="handleLogout">Log Out</button>
          </div>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();
const userEmail = ref('');
const dropdownOpen = ref(false);
const avatarWrapper = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    userEmail.value = user ? user.email : '';
  });

  document.addEventListener('click', handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
});

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

function handleOutsideClick(e) {
  if (avatarWrapper.value && !avatarWrapper.value.contains(e.target)) {
    dropdownOpen.value = false;
  }
}

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Logout Error:', error);
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
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.02em;
}

.brand-name-secondary {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6c47ff;
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
  font-size: 0.9rem;
  font-weight: 600;
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
  width: 20px;
  height: 20px;
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

/* ── Avatar + Dropdown ── */
.avatar-wrapper {
  position: relative;
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
  transition: background 0.15s;
}

.avatar:hover {
  background: #d0c6ff;
}

.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e8e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 6px;
  z-index: 200;
}

.dropdown-email {
  padding: 8px 10px;
  font-size: 0.8rem;
  color: #6b7080;
  font-weight: 500;
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background: #e8e8f0;
  margin: 4px 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f4f4f8;
}

.dropdown-item--danger {
  color: #dc3545;
}

.dropdown-item--danger:hover {
  background: #fff1f1;
}
</style>
