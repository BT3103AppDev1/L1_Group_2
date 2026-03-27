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
      <button class="btn-secondary"
        @click="handleMarkAllAsRead"
      >
        Mark all as read
        </button>
        <button class="btn-secondary"
          @click="showUnreadOnly = !showUnreadOnly"
        > 
          {{ showUnreadOnly ? "Show All" : "Show Unread Only" }}
        </button>
      </div>
    </div>

    
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-label">Unread Notifications</p>
        <p class="stat-value">{{ unreadCount }}</p>
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

    
    <div class="main-grid">

      
      <div class="alerts-column">

        <h2 class="section-title">All Alerts</h2>

        <div v-if="alerts.length === 0" class="empty-state">
          No alerts yet.
        </div>

        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="alert-card"
          :class="{ 'read-alert': alert.read }"
        >
          <div class="alert-content">
            <div class="alert-header">
              <h3 class="alert-title">{{ alert.title }}</h3>
              <span class="alert-time">Just now</span>
            </div>

            <p class="alert-message">{{ alert.message }}</p>

            <div class="alert-footer">
              <span class="alert-severity"
                :class="alert.severity"
              >
              {{ formatSeverity(alert) }}
              </span>
              <div class="alert-actions">
                <button class="link-btn"
                  @click="handleMarkAsRead(alert.id)"
                >
                Mark as read
                </button>
                <button class="link-btn danger"
                  @click="handleDelete(alert.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      
      <div class="sidebar">

        <div class="sidebar-card">
  <h3>⚙️ Preferences</h3>
  <p class="muted">Customize how you receive alerts.</p>

  <!-- Email Notifications -->
  <div class="pref-section">
    <div 
      class="pref-header"
      @click="showEmailPrefs = !showEmailPrefs"
    >
      <span>Email Notifications</span>
      <span>{{ showEmailPrefs ? "▲" : "▼" }}</span>
    </div>

    <div v-if="showEmailPrefs" class="pref-body">
      <label>
        <input 
          type="checkbox"
          v-model="preferences.emailNotifications"
          @change="savePreferences"
        />
        Enable email notifications
      </label>
    </div>
  </div>

  <!-- Budget Threshold -->
  <div class="pref-section">
    <div 
      class="pref-header"
      @click="showBudgetPrefs = !showBudgetPrefs"
    >
      <span>Budget Threshold</span>
      <span>{{ showBudgetPrefs ? "▲" : "▼" }}</span>
    </div>

    <div v-if="showBudgetPrefs" class="pref-body">
      <label>Monthly Budget Cap ($)</label>
      <input 
        type="number"
        v-model="preferences.budgetThreshold"
        @change="savePreferences"
      />
    </div>
  </div>
  <div class="sidebar-card insight-card">
  <div class="insight-header">
    <span>💡</span>
    <h4>Did you know?</h4>
  </div>

  <p>
    Users who set budget caps save an average of $240 per year 
    by catching unused recurring payments early.
  </p>

  <router-link to="/budget" class="insight-link">
    Learn more about Budget Setup →
  </router-link>
</div>
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
import { ref, computed, onMounted } from "vue"
import { getAuth } from "firebase/auth"
import { 
  getAlerts, 
  deleteAlert, 
  markAlertAsRead, 
  markAllAlertsAsRead 
} from "../services/alerts"
import { 
  addDoc, 
  collection, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore"

import { db } from "../firebase"
import { getSubscriptions } from "../services/subscriptions"

const subscriptions = ref([])

const alerts = ref([])
const showUnreadOnly = ref(false)

const unreadCount = computed(() =>
  alerts.value.filter(alert => !alert.read).length
)

const filteredAlerts = computed(() => {
  if (showUnreadOnly.value) {
    return alerts.value.filter(alert => !alert.read)
  }
  return alerts.value
})

const auth = getAuth()

const loadAlerts = async () => {
  const user = auth.currentUser
  if (!user) return
  alerts.value = await getAlerts(user.uid)
  const loadPreferences = async () => {
  const user = auth.currentUser
  if (!user) return

  preferences.value = await getPreferences(user.uid)
}
}

const handleDelete = async (alertId) => {
  const user = auth.currentUser
  if (!user) return

  alerts.value = alerts.value.filter(a => a.id !== alertId)
  await deleteAlert(user.uid, alertId)
}

const handleMarkAsRead = async (alertId) => {
  const user = auth.currentUser
  if (!user) return

  await markAlertAsRead(user.uid, alertId)

  alerts.value = alerts.value.map(alert =>
    alert.id === alertId
      ? { ...alert, read: true }
      : alert
  )
}

const handleMarkAllAsRead = async () => {
  const user = auth.currentUser
  if (!user) return

  await markAllAlertsAsRead(user.uid)

  alerts.value = alerts.value.map(alert => ({
    ...alert,
    read: true
  }))
}

import { getPreferences, updatePreferences } from "../services/preferences"
const showEmailPrefs = ref(false)
const showBudgetPrefs = ref(false)
const preferences = ref({
  emailNotifications: true,
  budgetThreshold: 500
})

const savePreferences = async () => {
  const user = auth.currentUser
  if (!user) return

  await updatePreferences(user.uid, preferences.value)
}

const checkRenewals = async () => {
  console.log("✅ Renewal check started")
  console.log("Subscriptions:", subscriptions.value)

  const user = auth.currentUser
  if (!user) return

  const today = new Date()
  today.setHours(0,0,0,0)

  subscriptions.value.forEach(async (sub) => {

  if (!sub.nextBillingDate) return

  const renewalDate = sub.nextBillingDate.toDate
    ? sub.nextBillingDate.toDate()
    : new Date(sub.nextBillingDate)

  renewalDate.setHours(0,0,0,0)

  const diffInDays = Math.round(
    (renewalDate - today) / (1000 * 60 * 60 * 24)
  )

  if (diffInDays >= 0 && diffInDays <= 2 && !sub.renewalAlertCreated) {

    await addDoc(
      collection(db, `users/${auth.currentUser.uid}/alerts`),
      {
        title: `Upcoming Renewal: ${sub.serviceName}`,
        message: `Your subscription renews in ${diffInDays} days.`,
        type: "renewal",
        severity: "warning",
        amount: sub.billingAmount,
        read: false,
        createdAt: serverTimestamp()
      }
    )

    await updateDoc(
      doc(db, `users/${auth.currentUser.uid}/subscriptions/${sub.id}`),
      { renewalAlertCreated: true }
    )
  }
})
}

const loadSubscriptions = async () => {
  const user = auth.currentUser
  if (!user) return

  subscriptions.value = await getSubscriptions(user.uid)
}

const formatSeverity = (alert) => {
  if (alert.type === "renewal") return "Renewal Soon"
  if (alert.type === "budget") return "Budget Alert"
  return alert.severity
}

onMounted(async () => {
  await loadSubscriptions()
  await checkRenewals()
  await loadAlerts()
})
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

.read-alert {
  opacity: 0.6;
  border-left-color: #d1d5db;
}

.insight-card {
  background: #f4f6ff;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.insight-link {
  display: inline-block;
  margin-top: 10px;
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

.insight-link:hover {
  text-decoration: underline;
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
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  text-transform: capitalize;
}

.alert-severity.warning {
  background: #fff3cd;
  color: #856404;
}

.alert-severity.critical {
  background: #fee2e2;
  color: #991b1b;
}

.alert-severity.info {
  background: #e0f2fe;
  color: #075985;
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

.pref-section {
  border-top: 1px solid #eee;
  padding: 10px 0;
}

.pref-header {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 500;
}

.pref-body {
  margin-top: 10px;
}

.pref-body input[type="number"] {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
}
</style>