// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth tools

import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue'; 

const routes = [
  { path: '/', redirect: '/login' },
  { 
    path: '/login', 
    component: Login,
    meta: { requiresGuest: true } 
  },
  { 
    path: '/register', 
    component: Register,
    meta: { requiresGuest: true } 
  },
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true } // This page is locked!
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Helper function: Wait for Firebase to figure out if the user is logged in
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

// This runs before every single page change
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  const currentUser = await getCurrentUser();

  if (requiresAuth && !currentUser) {
    // 1. If the page is locked and they aren't logged in, kick to login
    next('/login');
  } else if (requiresGuest && currentUser) {
    // 2. If they are already logged in, don't let them see the login/register pages! Send to dashboard.
    next('/dashboard');
  } else {
    // 3. Otherwise, let them through normally
    next();
  }
});

export default router;