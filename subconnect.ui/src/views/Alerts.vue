<template>
  <div class="alerts">

    <!-- ── Page header ───────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Alerts</h1>
        <p class="page-subtitle">Stay on top of your upcoming billing and budget limits.</p>
      </div>
    </div>

    <div v-if="alerts.length === 0" class="empty-state">
  No alerts yet.
</div>

<div v-for="alert in alerts" :key="alert.id" class="alert-card">
  <div class="alert-content">
    <h3 class="alert-title">{{ alert.title }}</h3>
    <p class="alert-message">{{ alert.message }}</p>
    <span class="alert-severity">{{ alert.severity }}</span>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getAuth } from "firebase/auth"
import { getAlerts } from "../services/alerts"

const alerts = ref([])
const auth = getAuth()

const loadAlerts = async () => {
  const user = auth.currentUser
  if (!user) return

  alerts.value = await getAlerts(user.uid)
}

onMounted(loadAlerts)
</script>

<style scoped>
.alerts {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 28px 64px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 4px;
  letter-spacing: -0.03em;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #6b7080;
  margin: 0;
}

.empty-state {
  padding: 20px;
  background: #f5f6fa;
  border-radius: 12px;
  color: #6b7080;
}

.alert-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #ececf3;
}

.alert-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 6px;
}

.alert-message {
  font-size: 0.9rem;
  margin: 0 0 10px;
  color: #555;
}

.alert-severity {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
}
</style>
