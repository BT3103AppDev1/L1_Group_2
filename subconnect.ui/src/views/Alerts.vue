<template>
  <div class="alerts">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Notifications & Alerts</h1>
        <p class="page-subtitle">
          Stay updated on your subscription lifecycle. Manage renewals and monitor your spending.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn-secondary">Mark all as read</button>
        <button class="btn-secondary">Filter</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-label">Unread Notifications</p>
        <p class="stat-value">{{ alerts.length }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Pending Renewals</p>
        <p class="stat-value">0</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Monthly Efficiency</p>
        <p class="stat-value">94%</p>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="main-grid">

      <!-- LEFT COLUMN -->
      <div class="alerts-column">

        <h2 class="section-title">All Alerts</h2>

        <div v-if="alerts.length === 0" class="empty-state">
          No alerts yet.
        </div>

        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-card"
        >
          <div class="alert-content">
            <div class="alert-header">
              <h3 class="alert-title">{{ alert.title }}</h3>
              <span class="alert-time">Just now</span>
            </div>

            <p class="alert-message">{{ alert.message }}</p>

            <div class="alert-footer">
              <span class="alert-severity">{{ alert.severity }}</span>
              <div class="alert-actions">
                <button class="link-btn">Mark as read</button>
                <button class="link-btn danger">Delete</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN -->
      <div class="sidebar">

        <div class="sidebar-card">
          <h3>Preferences</h3>
          <p>Customize how you receive alerts.</p>
        </div>

        <div class="sidebar-card">
          <h3>Recently Processed</h3>
          <p>Spotify Duo — $14.99</p>
        </div>

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

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6b7080;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e2e4ea;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #ececf3;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7080;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 6px;
}

/* Layout */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
}

/* Alert Card */
.alert-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #6366f1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.alert-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.alert-time {
  font-size: 0.75rem;
  color: #888;
}

.alert-message {
  font-size: 0.9rem;
  color: #555;
  margin: 6px 0 12px;
}

.alert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-severity {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  background: #fff3cd;
  color: #856404;
}

.alert-actions {
  display: flex;
  gap: 12px;
}

.link-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  color: #4f46e5;
}

.link-btn.danger {
  color: #dc2626;
}

/* Sidebar */
.sidebar-card {
  background: white;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #ececf3;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

/* Empty */
.empty-state {
  padding: 20px;
  background: #f5f6fa;
  border-radius: 12px;
  color: #6b7080;
}
</style>