<template>
  <div>
    <div v-if="loading" class="empty-state">
      Loading alerts...
    </div>

    <div v-else-if="alerts.length === 0" class="empty-state">
      You have no active alerts.
    </div>

    <div v-else class="alerts-preview">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
      >
        <div class="alert-row">
          <p class="alert-title">
            {{ alert.title }}
          </p>
          <span
            class="severity-badge"
            :class="alert.severity"
          >
            {{ formatSeverity(alert) }}
          </span>
        </div>

        <p class="alert-message">
          {{ alert.message }}
        </p>
      </div>

      <router-link to="/alerts" class="view-all-link">
        View All →
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getAuth } from "firebase/auth"
import { getAlerts } from "../services/alerts"

// const alerts = ref([])
// const loading = ref(true)
// const auth = getAuth()

// const loadAlerts = async () => {
//   const user = auth.currentUser
//   if (!user) return

//   const allAlerts = await getAlerts(user.uid)

//   alerts.value = allAlerts
//     .filter(alert => !alert.read)
//     .slice(0, 3)

//   loading.value = false
// }

const alerts = ref([])
const loading = ref(true)
const auth = getAuth()

const loadAlerts = async (uid) => {
  const allAlerts = await getAlerts(uid)
  alerts.value = allAlerts.filter(a => !a.read).slice(0, 3)
  loading.value = false
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      loading.value = false
      return
    }

    await loadAlerts(user.uid)
  })
})

const formatSeverity = (alert) => {
  if (alert.type === "renewal") return "Renewal Soon"
  if (alert.type === "budget") return "Budget Alert"
  return alert.severity
}

import { onAuthStateChanged } from "firebase/auth"

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return

    const allAlerts = await getAlerts(user.uid)
    alerts.value = allAlerts
      .filter(a => !a.read)
      .slice(0, 3)
  })
})
</script>

<style scoped>
.alert-item {
  padding: 14px 0;
  border-bottom: 1px solid #eee;
}

.alert-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.alert-message {
  font-size: 0.8rem;
  color: #6b7080;
  margin-top: 4px;
}

.severity-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: capitalize;
}

.severity-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.severity-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.view-all-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.85rem;
  color: #4f46e5;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.empty-state {
  font-size: 0.9rem;
  color: #888;
}
</style>