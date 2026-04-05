<template>
  <div class="dashboard">

    <!-- ── Page header ───────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back. Here's what's happening with your subscriptions today.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="showBudgetModal = true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16">
            <rect x="2" y="5" width="16" height="11" rx="2"/>
            <path d="M2 8h16"/>
          </svg>
          Set Budget Cap
        </button>
        <button class="btn-primary" @click="openAddModal">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="10" cy="10" r="8"/>
            <line x1="10" y1="6" x2="10" y2="14"/>
            <line x1="6" y1="10" x2="14" y2="10"/>
          </svg>
          Add Subscription
        </button>
      </div>
    </div>

    <!-- ── Loading ───────────────────────────────────────────────── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your subscriptions…</p>
    </div>

    <template v-else>

      <!-- ── Empty state ───────────────────────────────────────── -->
      <div v-if="subscriptions.length === 0" class="empty-state">
        <p class="empty-state-text">You currently have no tracked subscriptions. Add one to view your subscriptions!</p>
        <button class="btn-primary" @click="openAddModal">Add Subscription</button>
      </div>

      <template v-else>

      <!-- ── Summary cards ─────────────────────────────────────── -->
      <div class="summary-grid">
        <!-- Total Monthly Spend -->
        <div class="summary-card">
          <div class="card-top-row">
            <div class="card-icon card-icon--blue">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18">
                <rect x="2" y="5" width="16" height="11" rx="2"/>
                <path d="M2 8h16"/>
              </svg>
            </div>
            <span v-if="budgetCap" class="card-badge card-badge--warn">
              {{ budgetPct }}% of budget
            </span>
          </div>
          <p class="card-label">Total Monthly Spend</p>
          <p class="card-value">${{ monthlyTotal.toFixed(2) }}</p>
          <p class="card-sub">Across {{ subscriptions.length }} active subscription{{ subscriptions.length !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Yearly Spend -->
        <div class="summary-card">
          <div class="card-top-row">
            <div class="card-icon card-icon--green">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18">
                <polyline points="2,14 7,8 12,11 18,4"/>
              </svg>
            </div>
          </div>
          <p class="card-label">Yearly Spend Overview</p>
          <p class="card-value">${{ yearlyTotal.toFixed(2) }}</p>
          <p class="card-sub">Projected annual burn rate</p>
        </div>

        <!-- Upcoming Payments -->
        <div class="summary-card">
          <div class="card-top-row">
            <div class="card-icon card-icon--purple">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18">
                <rect x="3" y="4" width="14" height="13" rx="2"/>
                <line x1="3" y1="8" x2="17" y2="8"/>
                <line x1="7" y1="2" x2="7" y2="6"/>
                <line x1="13" y1="2" x2="13" y2="6"/>
              </svg>
            </div>
          </div>
          <p class="card-label">Upcoming Payments</p>
          <p class="card-value">{{ upcomingCount }} Service{{ upcomingCount !== 1 ? 's' : '' }}</p>
          <p class="card-sub">Due in the next 7 days</p>
        </div>
      </div>

      <!-- ── Chart + Alerts row ─────────────────────────────────── -->
      <div class="middle-row">

        <!-- Spending Trend Chart -->
        <div class="chart-card">
        <div class="chart-header">
          <div>
            <h2 class="chart-title">Spending Trend</h2>
            <p class="chart-sub">Monthly subscription expenditure over time.</p>
          </div>
          <span v-if="hasChartData" class="chart-range-badge">
            {{ chartRangeLabel }}
          </span>
        </div>

        <div v-if="!hasChartData" class="chart-empty">
          <p>No spending history yet. Add a subscription to get started.</p>
        </div>
        <div v-else class="chart-wrapper">
          <line-chart
            :data="chartData"
            :colors="['#6c47ff']"
            :curve="true"
            :area="true"
            :legend="false"
            :ytitle="'Amount ($)'"
            prefix="$"
            height="280px"
            :library="chartLibraryOptions"
          />
        </div>
      </div>

        <!-- Active Alerts panel -->
        <div class="alerts-card">
        <div class="alerts-header">
          <div class="alerts-title-row">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16">
              <path d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6z"/>
              <path d="M8 16.5a2 2 0 0 0 4 0"/>
            </svg>
            <span>Active Alerts</span>
          </div>
          <router-link to="/alerts" class="view-all-link">View All</router-link>
        </div>

        <div v-if="mockAlerts.length === 0" class="alerts-empty">
          <DashboardAlertsPreview />
        </div>

        <div v-else class="alerts-list">
          <div
            v-for="alert in mockAlerts"
            :key="alert.id"
            class="alert-item"
          >
            <div class="alert-icon-wrap" :class="`alert-icon-wrap--${alert.type}`">
              <svg v-if="alert.type === 'renewal'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16">
                <circle cx="10" cy="10" r="8"/>
                <polyline points="10,6 10,10 13,12"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16">
                <circle cx="10" cy="10" r="8"/>
                <line x1="10" y1="7" x2="10" y2="11"/>
                <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
              </svg>
            </div>
            <div class="alert-body">
              <p class="alert-name">{{ alert.name }}</p>
              <p class="alert-desc">{{ alert.description }}</p>
            </div>
            <div class="alert-right">
              <span class="alert-cost">${{ alert.cost }}</span>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14" class="alert-chevron">
                <polyline points="7,4 13,10 7,16"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      </div> <!-- end middle-row -->

      <!-- ── Top Subscriptions table ────────────────────────────── -->
      <div class="table-section">
        <div class="table-header">
          <h2 class="table-title">Top Subscriptions</h2>
          <button class="manage-all-btn">
            Manage All
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
              <polyline points="7,4 13,10 7,16"/>
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="subscriptions.length === 0" class="table-empty">
          <p>No subscriptions yet.</p>
          <button class="btn-primary" @click="openAddModal">Add your first subscription</button>
        </div>

        <div v-else class="table-wrapper">
          <table class="sub-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Monthly Cost</th>
                <th>Next Billing</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in topSubscriptions" :key="sub.id" class="sub-row">
                <td class="sub-service-cell">
                  <div class="service-avatar" :style="{ background: getAvatarColor(sub.serviceName) }">
                    {{ sub.serviceName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="service-name">{{ sub.serviceName }}</span>
                </td>
                <td><span class="category-tag">{{ sub.category || 'Other' }}</span></td>
                <td class="cost-cell">${{ toMonthlyCost(sub).toFixed(2) }}</td>
                <td class="date-cell">{{ formatDate(sub.nextBillingDate) }}</td>
                <td>
                  <span class="status-badge" :class="`status-badge--${sub.status?.toLowerCase()}`">
                    {{ sub.status || 'Active' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="row-action-btn" title="Edit" @click="openEdit(sub)">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
                      <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z"/>
                    </svg>
                  </button>
                  <button class="row-action-btn row-action-btn--danger" title="Delete" @click="confirmDelete(sub)">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
                      <polyline points="3,6 17,6"/>
                      <path d="M8 6V4h4v2"/>
                      <rect x="5" y="6" width="10" height="11" rx="1"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      </template> <!-- end v-else (has subscriptions) -->

    </template> <!-- end v-else (not loading) -->

    <!-- ── Add / Edit Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingId ? 'Edit Subscription' : 'Add Subscription' }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="4" y1="4" x2="16" y2="16"/>
                <line x1="16" y1="4" x2="4" y2="16"/>
              </svg>
            </button>
          </div>

          <div class="form-grid">
            <div class="form-group form-group--full">
              <label>Service Name *</label>
              <input v-model="form.serviceName" type="text" placeholder="e.g. Netflix" />
              <span v-if="formErrors.serviceName" class="field-error">{{ formErrors.serviceName }}</span>
              <span v-if="duplicateWarning" class="field-warning">A subscription with this name already exists.</span>
            </div>

            <div class="form-group">
              <label>Category</label>
              <select v-model="form.category">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="form-group">
              <label>Billing Amount (SGD) *</label>
              <input v-model="form.billingAmount" type="number" min="0" step="0.01" placeholder="0.00" />
              <span v-if="formErrors.billingAmount" class="field-error">{{ formErrors.billingAmount }}</span>
            </div>

            <div class="form-group">
              <label>Billing Cycle</label>
              <select v-model="form.billingCycle">
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div class="form-group">
              <label>Start Date</label>
              <input v-model="form.startDate" type="date" />
            </div>

            <div class="form-group">
              <label>Next Billing Date</label>
              <input v-model="form.nextBillingDate" type="date" />
            </div>

            <div class="form-group form-group--full">
              <label>Notes <span class="optional">(optional)</span></label>
              <input v-model="form.notes" type="text" placeholder="e.g. Shared with family" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-ghost" @click="closeModal">Cancel</button>
            <button class="btn-primary" :disabled="saving" @click="handleSave">
              {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Subscription') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Budget Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showBudgetModal" class="modal-overlay" @click.self="showBudgetModal = false">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">Set Monthly Budget Cap</h3>
            <button class="modal-close" @click="showBudgetModal = false">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="4" y1="4" x2="16" y2="16"/>
                <line x1="16" y1="4" x2="4" y2="16"/>
              </svg>
            </button>
          </div>
          <div class="form-group">
            <label>Monthly Budget (SGD)</label>
            <input v-model="budgetInput" type="number" min="0" step="1" placeholder="e.g. 150" />
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" @click="showBudgetModal = false">Cancel</button>
            <button class="btn-primary" @click="handleSetBudget">Save</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Delete Confirm Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">Delete Subscription?</h3>
          </div>
          <p class="modal-body-text">
            Are you sure you want to remove <strong>{{ deleteTarget.serviceName }}</strong>? This cannot be undone.
          </p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="deleteTarget = null">Cancel</button>
            <button class="btn-danger" :disabled="saving" @click="handleDelete">
              {{ saving ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
  
</template>

<script>
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getBudget,
  setBudget,
  toMonthlyCost,
} from '@/services/subscriptions'
import DashboardAlertsPreview from "@/components/DashboardAlertsPreview.vue"

const AVATAR_COLORS = [
  '#6c47ff', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
]

export default {
  name: 'DashboardView',

  components: {
    DashboardAlertsPreview  
  },

  data() {
    return {
      // ── Loading / saving state ──
      loading: true,
      saving: false,
      uid: null,

      // ── Firestore data ──
      subscriptions: [],
      budgetCap: null,

      // ── Modal visibility ──
      showModal: false,
      showBudgetModal: false,

      // ── Edit / delete targets ──
      editingId: null,
      deleteTarget: null,

      // ── Budget input ──
      budgetInput: '',

      // ── Add/Edit form fields ──
      form: {
        serviceName: '',
        category: '',
        billingAmount: '',
        billingCycle: 'Monthly',
        startDate: '',
        nextBillingDate: '',
        status: 'Active',
        notes: '',
      },

      // ── Form validation errors ──
      formErrors: {},

      // ── Dropdown options ──
      categories: [
        'Entertainment', 'Music', 'Cloud Storage', 'Productivity',
        'Gaming', 'News', 'Fitness', 'Career', 'Development', 'Other',
      ],

      mockAlerts: [],
    }
  },

  computed: {
    // Sum of all subscriptions normalised to monthly cost
    monthlyTotal() {
      return this.subscriptions.reduce((sum, s) => sum + toMonthlyCost(s), 0)
    },

    // Projected yearly spend
    yearlyTotal() {
      return this.monthlyTotal * 12
    },

    // Budget usage as a percentage
    budgetPct() {
      if (!this.budgetCap) return 0
      return Math.round((this.monthlyTotal / this.budgetCap) * 100)
    },

    // Number of subscriptions with nextBillingDate within 7 days
    upcomingCount() {
      const now = new Date()
      const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return this.subscriptions.filter((s) => {
        if (!s.nextBillingDate) return false
        const d = new Date(s.nextBillingDate)
        return d >= now && d <= in7
      }).length
    },

    // Top 5 subscriptions by monthly cost for the table
    topSubscriptions() {
      return [...this.subscriptions]
        .sort((a, b) => toMonthlyCost(b) - toMonthlyCost(a))
        .slice(0, 5)
    },

    // Chart data: always show the last 12 months
    // vue-chartkick expects { 'Label': value, ... }
    chartData() {
      const map = this.buildMonthMap() // keys are 'YYYY-MM'
      const now = new Date()
      const data = {}
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('default', { month: 'short', year: 'numeric' })
        data[label] = parseFloat((map[key] || 0).toFixed(2))
      }
      return data
    },

    // Whether there is any chart data to display
    hasChartData() {
      return Object.keys(this.chartData).length > 0
    },

    // e.g. "Jan 2025 – Mar 2025"
    chartRangeLabel() {
      const keys = Object.keys(this.chartData)
      if (keys.length === 0) return ''
      if (keys.length === 1) return keys[0]
      return `${keys[0]} – ${keys[keys.length - 1]}`
    },

    chartLibraryOptions() {
      return {
        plugins: {
          tooltip: {
            titleFont: { size: 15 },
            bodyFont: { size: 14 },
            padding: 14,
            boxPadding: 6,
          },
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              font: { size: 10 },
              callback: function (val) {
                const label = this.getLabelForValue(val)
                const parts = label.split(' ')
                return [parts[0], parts[1]]
              },
            },
          },
        },
      }
    },

    // Warn if a subscription with the same name already exists
    duplicateWarning() {
      if (!this.form.serviceName) return false
      return this.subscriptions.some(
        (s) =>
          s.serviceName.toLowerCase() === this.form.serviceName.toLowerCase() &&
          s.id !== this.editingId
      )
    },
  },

  watch: {
    'form.startDate'(val) {
      if (val) this.autoSetNextBillingDate()
    },
    'form.billingCycle'() {
      if (this.form.startDate) this.autoSetNextBillingDate()
    },
  },

  mounted() {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (!user) {
        this.loading = false
        return
      }
      this.uid = user.uid
      try {
        const [subs, budget] = await Promise.all([
          getSubscriptions(user.uid),
          getBudget(user.uid),
        ])
        this.subscriptions = subs
        this.budgetCap = budget
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        this.loading = false
      }
    })
  },

  methods: {
    // ── Helper Functions ──────────────────────────────────────────────────

    autoSetNextBillingDate() {
      const d = new Date(this.form.startDate)
      if (isNaN(d)) return
      if (this.form.billingCycle === 'Annually') {
        d.setFullYear(d.getFullYear() + 1)
      } else {
        d.setMonth(d.getMonth() + 1)
      }
      this.form.nextBillingDate = d.toISOString().slice(0, 10)
    },

    // Expose toMonthlyCost to the template
    toMonthlyCost(sub) {
      return toMonthlyCost(sub)
    },

    // Build a { 'YYYY-MM': totalMonthlyCost } map from subscriptions.
    // Each subscription contributes its monthly cost from its start month
    // through to the current month (since we have no end date for cancellations).
    buildMonthMap() {
      const map = {}
      const now = new Date()
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      this.subscriptions.forEach((s) => {
        let dateRef = null
        if (s.startDate) {
          dateRef = new Date(s.startDate)
        } else if (s.createdAt?.toDate) {
          dateRef = s.createdAt.toDate()
        }
        if (!dateRef || isNaN(dateRef)) return

        const monthlyCost = toMonthlyCost(s)
        let y = dateRef.getFullYear()
        let m = dateRef.getMonth() + 1

        while (true) {
          const key = `${y}-${String(m).padStart(2, '0')}`
          if (key > currentKey) break
          map[key] = (map[key] || 0) + monthlyCost
          m++
          if (m > 12) { m = 1; y++ }
        }
      })
      return map
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      const d = new Date(dateStr)
      if (isNaN(d)) return dateStr
      return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
    },

    getAvatarColor(name) {
      const idx = name.charCodeAt(0) % AVATAR_COLORS.length
      return AVATAR_COLORS[idx]
    },

    validateForm() {
      const errors = {}
      if (!this.form.serviceName.trim()) {
        errors.serviceName = 'Service name is required.'
      }
      if (!this.form.billingAmount || isNaN(this.form.billingAmount) || Number(this.form.billingAmount) < 0) {
        errors.billingAmount = 'Please enter a valid amount.'
      }
      this.formErrors = errors
      return Object.keys(errors).length === 0
    },

    resetForm() {
      this.form = {
        serviceName: '',
        category: '',
        billingAmount: '',
        billingCycle: 'Monthly',
        startDate: '',
        nextBillingDate: '',
        status: 'Active',
        notes: '',
      }
      this.formErrors = {}
    },

    // ── Modal handlers ────────────────────────────────────────────

    openAddModal() {
      this.editingId = null
      this.resetForm()
      this.showModal = true
    },

    openEdit(sub) {
      this.editingId = sub.id
      this.form = {
        serviceName:     sub.serviceName,
        category:        sub.category || '',
        billingAmount:   sub.billingAmount,
        billingCycle:    sub.billingCycle || 'Monthly',
        startDate:       sub.startDate || '',
        nextBillingDate: sub.nextBillingDate || '',
        status:          sub.status || 'Active',
        notes:           sub.notes || '',
      }
      this.formErrors = {}
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.editingId = null
      this.resetForm()
    },

    confirmDelete(sub) {
      this.deleteTarget = sub
    },

    // ── Firestore actions ─────────────────────────────────────────

    async handleSave() {
      if (!this.validateForm()) return
      const uid = this.uid
      if (!uid) return
      this.saving = true
      try {
        const payload = {
          serviceName:     this.form.serviceName.trim(),
          category:        this.form.category,
          billingAmount:   Number(this.form.billingAmount),
          billingCycle:    this.form.billingCycle,
          startDate:       this.form.startDate,
          nextBillingDate: this.form.nextBillingDate,
          status:          this.form.status,
          notes:           this.form.notes,
        }
        if (this.editingId) {
          await updateSubscription(uid, this.editingId, payload)
          const idx = this.subscriptions.findIndex((s) => s.id === this.editingId)
          if (idx !== -1) {
            this.subscriptions[idx] = { ...this.subscriptions[idx], ...payload }
          }
        } else {
          const newId = await addSubscription(uid, payload)
          this.subscriptions.unshift({ id: newId, ...payload, createdAt: { toDate: () => new Date() } })
        }
        this.closeModal()
      } catch (err) {
        console.error('Save failed:', err)
      } finally {
        this.saving = false
      }
    },

    async handleDelete() {
      if (!this.deleteTarget) return
      const uid = this.uid
      if (!uid) return
      this.saving = true
      try {
        await deleteSubscription(uid, this.deleteTarget.id)
        this.subscriptions = this.subscriptions.filter((s) => s.id !== this.deleteTarget.id)
        this.deleteTarget = null
      } catch (err) {
        console.error('Delete failed:', err)
      } finally {
        this.saving = false
      }
    },

    async handleSetBudget() {
      const uid = auth.currentUser?.uid
      if (!uid || !this.budgetInput) return
      await setBudget(uid, this.budgetInput)
      this.budgetCap = Number(this.budgetInput)
      this.showBudgetModal = false
      this.budgetInput = ''
    },
  },
}
</script>

<style scoped>
/* ── Base ── */
.dashboard {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 28px 64px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a2e;
  background: #f8f9fa;
  min-height: 100vh;
}

/* ── Page header ── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 6px;
  letter-spacing: -0.03em;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #6b7080;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* ── Buttons ── */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 24px;
  border-radius: 9px;
  border: none;
  background: #6c47ff;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-primary:hover { background: #5535d4; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 24px;
  border-radius: 9px;
  border: 1px solid #ddd;
  background: #fff;
  color: #1a1a2e;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}
.btn-secondary:hover { border-color: #6c47ff; background: #f9f7ff; }

.btn-ghost {
  padding: 10px 18px;
  border-radius: 9px;
  border: 1px solid #ddd;
  background: transparent;
  color: #6b7080;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-ghost:hover { border-color: #6c47ff; color: #6c47ff; }

.btn-danger {
  padding: 10px 18px;
  border-radius: 9px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}
.btn-danger:disabled { opacity: 0.5; }

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 80px 24px;
  text-align: center;
}

.empty-state-text {
  font-size: 1rem;
  color: #6b7080;
  max-width: 400px;
  line-height: 1.6;
  margin: 0;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 0;
  color: #6b7080;
  font-size: 0.9rem;
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #6c47ff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Summary cards ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-icon--blue   { background: #eff6ff; color: #3b82f6; }
.card-icon--green  { background: #f0fdf4; color: #10b981; }
.card-icon--purple { background: #f5f3ff; color: #6c47ff; }

.card-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 99px;
}
.card-badge--warn { background: #fff7ed; color: #ea580c; }

.card-label {
  font-size: 0.8rem;
  color: #6b7080;
  margin: 0;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 2px 0 0;
  letter-spacing: -0.03em;
}

.card-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 2px 0 0;
}

/* ── Middle row ── */
.middle-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  margin-bottom: 28px;
  align-items: stretch;
}

/* Chart card */
.chart-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  min-width: 0;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.chart-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.chart-range-badge {
  background: #f4f4f8;
  color: #6b7080;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
  font-size: 0.88rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #e8e8f0;
}

.chart-wrapper {
  margin: 0 -4px;
}

/* Alerts card */
.alerts-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
}

.alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.alerts-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a2e;
}

.view-all-link {
  font-size: 0.8rem;
  color: #6c47ff;
  text-decoration: none;
  font-weight: 500;
}
.view-all-link:hover { text-decoration: underline; }

.alerts-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.88rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid #f0f0f5;
  cursor: pointer;
  transition: background 0.12s;
}
.alert-item:hover { background: #f4f4f8; }

.alert-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.alert-icon-wrap--renewal { background: #eff6ff; color: #3b82f6; }
.alert-icon-wrap--budget  { background: #fff1f2; color: #ef4444; }

.alert-body { flex: 1; min-width: 0; }
.alert-name { font-size: 0.82rem; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.alert-desc { font-size: 0.74rem; color: #9ca3af; margin: 0; }

.alert-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.alert-cost { font-size: 0.82rem; font-weight: 700; color: #1a1a2e; }
.alert-chevron { color: #d1d5db; }


/* ── Table section ── */
.table-section {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f5;
}

.table-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.manage-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6b7080;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.15s;
}
.manage-all-btn:hover { color: #6c47ff; }

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
  color: #9ca3af;
  font-size: 0.9rem;
}

.table-wrapper { overflow-x: auto; }

.sub-table {
  width: 100%;
  border-collapse: collapse;
}

.sub-table thead tr {
  background: #fafafa;
}

.sub-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  border-bottom: 1px solid #f0f0f5;
}

.sub-row {
  border-bottom: 1px solid #f9f9fb;
  transition: background 0.1s;
}
.sub-row:last-child { border-bottom: none; }
.sub-row:hover { background: #fafafa; }

.sub-table td { padding: 14px 16px; font-size: 0.875rem; }

.sub-service-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-name { font-weight: 600; color: #1a1a2e; }

.category-tag {
  background: #f4f4f8;
  color: #6b7080;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.cost-cell { font-weight: 600; color: #1a1a2e; }
.date-cell { color: #6b7080; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}
.status-badge--active     { background: #f0fdf4; color: #16a34a; }
.status-badge--paused     { background: #fff7ed; color: #ea580c; }
.status-badge--cancelled  { background: #fef2f2; color: #dc2626; }

.actions-cell {
  display: flex;
  gap: 4px;
}

.row-action-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s;
}
.row-action-btn:hover { background: #f4f4f8; color: #6c47ff; }
.row-action-btn--danger:hover { background: #fef2f2; color: #ef4444; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
}
.modal--sm { max-width: 400px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.modal-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: #f4f4f8;
  color: #6b7080;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: #e8e8f0; }

.modal-body-text {
  font-size: 0.9rem;
  color: #6b7080;
  margin: 0 0 24px;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group--full { grid-column: span 2; }

.form-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  text-transform: none;
  letter-spacing: 0;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
  color: #1a1a2e;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.form-group input:focus,
.form-group select:focus { border-color: #6c47ff; background: #fff; }

.field-error   { font-size: 0.75rem; color: #ef4444; }
.field-warning { font-size: 0.75rem; color: #ea580c; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
.summary-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .summary-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group--full { grid-column: span 1; }
}
</style>