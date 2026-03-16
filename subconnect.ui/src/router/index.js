import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: Login,
    meta: { requiresGuest: true, layout: 'auth' },
  },
  {
    path: '/register',
    component: Register,
    meta: { requiresGuest: true, layout: 'auth' },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/comparison',
    component: () => import('../views/Comparison.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/alerts',
    component: () => import('../views/Alerts.vue'),
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  const currentUser = await getCurrentUser()

  if (requiresAuth && !currentUser) {
    next('/login')
  } else if (requiresGuest && currentUser) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router