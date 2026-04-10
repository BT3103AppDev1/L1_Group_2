<template>
  <div class="comparison">
    <!-- ── Page header ───────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Comparison</h1>
        <p class="page-subtitle">Compare your subscriptions side by side.</p>
      </div>
    </div>

    <!-- ── Summary Cards ─────────────────────────────────────── -->
    <div class="summary-grid">
      <div class="summary-card">
        <p class="card-label">Potential Annual Savings</p>
        <p class="card-value">${{ totalSavings.toFixed(2) }}</p>
        <p class="card-sub">Amount you could save yearly</p>
      </div>

      <div class="summary-card">
        <p class="card-label">Portfolio Score</p>
        <p class="card-value">{{ score }}/100</p>
        <p class="card-sub">Based on pricing efficiency</p>
      </div>

      <div class="summary-card">
        <p class="card-label">Savings vs Market Average</p>
        <p class="card-value" :class ="averageDifference > 0 ? 'price-bad' : 'price-good'" > {{ averageDifference > 0 ? '+' : '-'}}${{ Math.abs(averageDifference).toFixed(2) }}</p>
        <p class="card-sub">Difference from market pricing</p>
      </div>
    </div>

    <!-- ── Chart ─────────────────────────────────────── -->
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h2 class="chart-title">Cost vs Market Average</h2>
          <p class="chart-sub">See how your spending compares.</p>
        </div>
      </div>

      <div class="chart-list">
        <div v-for="item in comparisons" :key="item.name" class="chart-row">
          <div class="chart-label">{{ item.name }}</div>

          <div class="bar-container">
            <div
              class="bar user-bar"
              :style="{ width: getUserWidth(item) + '%' }"
            >
              ${{ item.userPrice }}
            </div>

            <div
              class="bar benchmark-bar"
              :style="{ width: getBenchmarkWidth(item) + '%' }"
            >
              ${{ item.benchmarkPrice }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Table ─────────────────────────────────────── -->
    <div class="table-section">
      <div class="table-header">
        <h2 class="table-title">Value-for-Money Directory</h2>
      </div>

      <div class="table-wrapper">
        <table class="sub-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Current Cost</th>
              <th>Benchmark</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in comparisons" :key="item.name" class="sub-row">
              <!-- ── Service ────── -->
              <td class="sub-service-cell">
                <div class="service-avatar">
                  {{ item.name.charAt(0).toUpperCase() }}
                </div>
                <span class="service-name">{{ item.name }}</span>
              </td>

              <!-- ── Category ────── -->
              <td>
                <span class="category-tag">
                  {{ item.category || 'Other' }}
                </span>
              </td>

              <!-- Cost -->
              <td class="cost-cell">${{ item.userPrice }}</td>

              <!-- Benchmark -->
              <td>${{ item.benchmarkPrice }}</td>

              <!-- Score -->
              <td>
                <span
                  class="status-badge"
                  :class="`status-badge--${item.status}`"
                >
                  {{ item.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'ComparisonView',

  data() {
    return {
      comparisons: [],
      uid: null,
    };
  },

  computed: {
    totalSavings() {
      return this.comparisons.reduce((sum, item) => {
        if (item.userPrice > item.benchmarkPrice) {
          return sum + (item.userPrice - item.benchmarkPrice);
        }
        return sum;
      }, 0);
    },

    score() {
      if (this.comparisons.length === 0) { return 0; }
      const good = this.comparisons.filter(
        (i) => i.status === 'excellent',
      ).length;
      return Math.round((good / this.comparisons.length) * 100);
    },

    averageDifference() {
      if (this.comparisons.length === 0) {
        return 0;
      }

      const total = this.comparisons.reduce((sum, item) => {
        return sum + (item.userPrice - item.benchmarkPrice);
      }, 0);
      return total / this.comparisons.length;
    }
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      this.uid = user.uid;
      await this.loadData();
    });
  },

  methods: {
    async loadData() {
      const subSnap = await getDocs(
        collection(db, 'users', this.uid, 'subscriptions'),
      );
      const subscriptions = subSnap.docs.map((doc) => doc.data());

      const benchSnap = await getDocs(collection(db, 'benchmarks'));
      const benchmarks = benchSnap.docs.map((doc) => doc.data());

      this.comparisons = subscriptions.map((sub) => {
        const match = benchmarks.find(
          (b) => b.serviceName.toLowerCase() === sub.serviceName.toLowerCase(),
        );

        const benchmarkPrice = match?.billingAmount || 0;
        const userPrice = sub.billingAmount || 0;

        let status = 'fair';
        if (userPrice > benchmarkPrice) status = 'poor';
        if (userPrice < benchmarkPrice) status = 'excellent';

        return {
          name: sub.serviceName,
          category: sub.category,
          userPrice,
          benchmarkPrice,
          status,
        };
      });
    },

    getUserWidth(item) {
      const max = Math.max(item.userPrice, item.benchmarkPrice);
      return (item.userPrice / max) * 100;
    },

    getBenchmarkWidth(item) {
      const max = Math.max(item.userPrice, item.benchmarkPrice);
      return (item.benchmarkPrice / max) * 100;
    },

    suggestSwitch(item) {
      alert(
        `You can save $${(item.userPrice - item.benchmarkPrice).toFixed(2)}`,
      );
    },
  },
};
</script>

<style scoped>
/* ── Base ── */
.comparison {
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

/* ── Summary Cards ── */
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
}

.card-label {
  font-size: 0.8rem;
  color: #6b7080;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 800;
}

.price-good {
  color: #16a34a;
}

.price-bad {
  color: #dc2626;
}

/* ── Chart ── */
.chart-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
}

.chart-sub {
  font-size: 0.8rem;
  color: #9ca3af;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-row {
  display: flex;
  flex-direction: column;
}

.chart-label {
  font-size: 0.8rem;
  margin-bottom: 4px;
}

/* Bar chart */
.bar-container {
  display: flex;
  gap: 6px;
}

.bar {
  height: 18px;
  border-radius: 6px;
  font-size: 0.7rem;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 6px;
}

.user-bar {
  background: #6c47ff;
}

.benchmark-bar {
  background: #10b981;
}

/* table */
.table-section {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f5;
}

.table-title {
  font-size: 1rem;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
}

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
  color: #9ca3af;
  border-bottom: 1px solid #f0f0f5;
}

.sub-table td {
  padding: 14px 16px;
  font-size: 0.875rem;
}

.sub-row {
  border-bottom: 1px solid #f9f9fb;
}

/* service and category */
.sub-service-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #6c47ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.service-name {
  font-weight: 600;
}

.category-tag {
  background: #f4f4f8;
  color: #6b7080;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
}

/* cost and status */
.cost-cell {
  font-weight: 600;
}

/* Status badges */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-badge--excellent {
  background: #f0fdf4;
  color: #16a34a;
}

.status-badge--fair {
  background: #fff7ed;
  color: #ea580c;
}

.status-badge--poor {
  background: #fef2f2;
  color: #dc2626;
}

</style>
