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
        <p class="card-value" :class="averageDifference > 0 ? 'price-bad' : 'price-good'">{{ averageDifference > 0 ? '+' : '-' }}${{ Math.abs(averageDifference).toFixed(2) }}</p>
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
            <div class="bar user-bar" :style="{ width: getUserWidth(item) + '%' }">
              ${{ item.userPrice }}
            </div>
            <div class="bar benchmark-bar" :style="{ width: getBenchmarkWidth(item) + '%' }">
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
              <td class="sub-service-cell">
                <div class="service-avatar">{{ item.name.charAt(0).toUpperCase() }}</div>
                <span class="service-name">{{ item.name }}</span>
              </td>
              <td><span class="category-tag">{{ item.category || 'Other' }}</span></td>
              <td class="cost-cell">${{ item.userPrice }}</td>
              <td>${{ item.benchmarkPrice }}</td>
              <td>
                <span class="status-badge" :class="`status-badge--${item.status}`">
                  {{ item.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── AI Analysis Section ─────────────────────────────────── -->
    <div class="ai-section">

      <!-- Controls bar -->
      <div class="ai-controls-card">
        <div class="ai-controls-left">
          <span class="controls-heading">AI Savings Analysis</span>
          <p class="controls-sub">Powered by Gemini &middot; Competitors checked automatically</p>
        </div>
        <div class="ai-controls-right">
          <div class="toggle-group">
            <button
              v-for="opt in optionList"
              :key="opt.key"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': enabledOptions[opt.key] }"
              @click="toggleOption(opt.key)"
            >
              {{ opt.label }}
            </button>
          </div>
          <button
            class="btn-analyse"
            :disabled="aiLoading || autoRunning || comparisons.length === 0 || !hasUncachedData"
            @click="analyseAll"
          >
            <span v-if="aiLoading" class="spinner"></span>
            <span v-else>&#10024;</span>
            {{ aiLoading ? 'Analysing...' : 'Analyse' }}
          </button>
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="aiError" class="ai-error-banner">
        <span>{{ aiError }}</span>
        <button class="ai-error-dismiss" @click="aiError = null">&times;</button>
      </div>

      <!-- Auto-running hint -->
      <div v-if="autoRunning" class="ai-status-hint">
        <span class="spinner spinner--sm"></span>
        Fetching competitor alternatives...
      </div>

      <!-- Results -->
      <template v-if="hasAnyResults">
        <h3 class="ai-results-title">AI Savings Report</h3>

        <div v-for="comp in comparisons" :key="comp.id" class="ai-card">
          <!-- Only show cards that have at least one result for an enabled type -->
          <template v-if="hasResultsForComp(comp)">
            <div class="ai-card-header" @click="toggleCard(comp.id)">
              <div class="ai-card-service">
                <div class="service-avatar service-avatar--sm">
                  {{ comp.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="ai-card-name">{{ comp.name }}</span>
                  <span class="ai-card-current">Current: ${{ comp.userPrice.toFixed(2) }}/mo</span>
                </div>
              </div>
              <div class="ai-card-meta">
                <span v-if="bestSavingsForComp(comp) > 0" class="ai-savings-pill">
                  Save up to ${{ bestSavingsForComp(comp).toFixed(2) }}/mo
                </span>
                <!-- Per-type loading indicators for this card -->
                <span v-if="isCompLoading(comp)" class="spinner spinner--sm"></span>
                <span class="ai-chevron" :class="{ 'ai-chevron--open': openCards.includes(comp.id) }">&#8250;</span>
              </div>
            </div>

            <div v-if="openCards.includes(comp.id)" class="ai-card-body">
              <!-- Section per enabled option type -->
              <template v-for="opt in optionList" :key="opt.key">
                <div v-if="enabledOptions[opt.key]" class="type-section">
                  <div class="type-section-header">
                    <span class="type-badge" :class="`type-badge--${opt.key}`">{{ opt.label }}</span>
                    <span v-if="!comp.aiCache?.[opt.key]" class="type-not-fetched">
                      {{ aiLoading ? 'Analysing...' : 'Not yet analysed — click Analyse' }}
                    </span>
                  </div>

                  <template v-if="comp.aiCache?.[opt.key]">
                    <div
                      v-for="alt in comp.aiCache[opt.key].alternatives"
                      :key="alt.name"
                      class="alt-row"
                    >
                      <div class="alt-left">
                        <span class="alt-name">{{ alt.name }}</span>
                      </div>
                      <div class="alt-right">
                        <span class="alt-price">${{ alt.price.toFixed(2) }}/mo</span>
                        <span class="alt-save">save ${{ alt.savingsPerMonth.toFixed(2) }}/mo</span>
                      </div>
                      <p class="alt-note">{{ alt.note }}</p>
                    </div>

                    <p v-if="!comp.aiCache[opt.key].alternatives?.length" class="alt-empty">
                      No cheaper alternatives found for this category.
                    </p>
                  </template>
                </div>
              </template>

              <!-- Best recommendation -->
              <div v-if="bestRecommendationForComp(comp)" class="ai-recommendation">
                <span class="rec-icon">&#128161;</span>
                {{ bestRecommendationForComp(comp) }}
              </div>
            </div>
          </template>

          <!-- Card for a sub still being auto-analysed -->
          <template v-else-if="autoRunning && !comp.aiCache?.competitors">
            <div class="ai-card-header ai-card-header--loading">
              <div class="ai-card-service">
                <div class="service-avatar service-avatar--sm">
                  {{ comp.name.charAt(0).toUpperCase() }}
                </div>
                <span class="ai-card-name">{{ comp.name }}</span>
              </div>
              <span class="spinner spinner--sm"></span>
            </div>
          </template>
        </div>
      </template>

      <!-- Empty state when auto-run is done but no results visible yet -->
      <div v-else-if="!autoRunning && !aiLoading && comparisons.length > 0 && !hasAnyResults" class="ai-empty">
        Click <strong>Analyse</strong> to get AI-powered savings suggestions for your subscriptions.
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { analyzeSubscriptions as geminiAnalyze } from '@/services/gemini';

const OPTION_LIST = [
  { key: 'competitors', label: 'Competitors' },
  { key: 'student', label: 'Student' },
  { key: 'family', label: 'Family Plan' },
  { key: 'cheaper_tier', label: 'Cheaper Tiers' },
];

export default {
  name: 'ComparisonView',

  data() {
    return {
      comparisons: [],
      uid: null,
      enabledOptions: {
        competitors: true,
        student: false,
        family: false,
        cheaper_tier: false,
      },
      optionList: OPTION_LIST,
      autoRunning: false,
      aiLoading: false,
      aiError: null,
      openCards: [],
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
      if (this.comparisons.length === 0) return 0;
      const good = this.comparisons.filter((i) => i.status === 'excellent').length;
      return Math.round((good / this.comparisons.length) * 100);
    },

    averageDifference() {
      if (this.comparisons.length === 0) return 0;
      const total = this.comparisons.reduce(
        (sum, item) => sum + (item.userPrice - item.benchmarkPrice),
        0,
      );
      return total / this.comparisons.length;
    },

    // True if any (comp, optType) pair is enabled but not yet cached
    hasUncachedData() {
      for (const comp of this.comparisons) {
        for (const [optType, enabled] of Object.entries(this.enabledOptions)) {
          if (enabled && !comp.aiCache?.[optType]) return true;
        }
      }
      return false;
    },

    // True if any enabled+cached result exists to display
    hasAnyResults() {
      for (const comp of this.comparisons) {
        if (this.hasResultsForComp(comp)) return true;
      }
      return false;
    },
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      this.uid = user.uid;
      await this.loadData();
      // Auto-run competitors for any subscription that hasn't been analysed yet
      await this.autoRunCompetitors();
    });
  },

  methods: {
    async loadData() {
      const subSnap = await getDocs(collection(db, 'users', this.uid, 'subscriptions'));
      const subscriptions = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const benchSnap = await getDocs(collection(db, 'benchmarks'));
      const benchmarks = benchSnap.docs.map((d) => d.data());

      this.comparisons = subscriptions.map((sub) => {
        const match = benchmarks.find(
          (b) => b.serviceName.toLowerCase() === sub.serviceName.toLowerCase(),
        );

        const benchmarkPrice = match?.billingAmount || 0;
        const userPrice = sub.billingAmount || 0;

        let status = 'fair';
        if (userPrice > benchmarkPrice && benchmarkPrice > 0) status = 'poor';
        if (userPrice < benchmarkPrice) status = 'excellent';

        return {
          id: sub.id,
          name: sub.serviceName,
          category: sub.category,
          userPrice,
          benchmarkPrice,
          status,
          aiCache: sub.aiCache || {},
        };
      });
    },

    // Silently fetch competitors for any subscription without a cached result
    async autoRunCompetitors() {
      const uncached = this.comparisons.filter((c) => !c.aiCache?.competitors);
      if (uncached.length === 0) return;

      this.autoRunning = true;
      // Auto-open all cards once results arrive
      try {
        await this._runAnalysis([{ optionTypes: ['competitors'], subs: uncached }]);
        this.openCards = this.comparisons
          .filter((c) => this.hasResultsForComp(c))
          .map((c) => c.id);
      } catch (err) {
        // Silent failure — auto-run is best-effort
        console.error('Auto competitors analysis failed:', err);
      } finally {
        this.autoRunning = false;
      }
    },

    // Manual "Analyse" button — fetches only what isn't already cached for enabled types
    async analyseAll() {
      // Group subs by the unique set of option types they need
      const groups = {};
      for (const comp of this.comparisons) {
        const needed = [];
        for (const [optType, enabled] of Object.entries(this.enabledOptions)) {
          if (enabled && !comp.aiCache?.[optType]) needed.push(optType);
        }
        if (needed.length === 0) continue;
        const key = [...needed].sort().join(',');
        if (!groups[key]) groups[key] = { optionTypes: needed, subs: [] };
        groups[key].subs.push(comp);
      }

      const groupList = Object.values(groups);
      if (groupList.length === 0) return;

      this.aiLoading = true;
      this.aiError = null;
      try {
        await this._runAnalysis(groupList);
        // Expand cards that now have results
        for (const comp of this.comparisons) {
          if (this.hasResultsForComp(comp) && !this.openCards.includes(comp.id)) {
            this.openCards.push(comp.id);
          }
        }
      } catch (err) {
        console.error('AI analysis error:', err);
        this.aiError = err.message || 'Analysis failed. Please try again.';
      } finally {
        this.aiLoading = false;
      }
    },

    // Shared helper: calls Gemini for each group and writes results to Firestore + local state
    async _runAnalysis(groups) {
      for (const group of groups) {
        const analyses = await geminiAnalyze(group.subs, group.optionTypes);

        for (const analysis of analyses) {
          const comp = this.comparisons.find((c) => c.id === analysis.subId);
          if (!comp) continue;

          const firestoreUpdate = {};
          for (const [optType, data] of Object.entries(analysis.byType || {})) {
            const cacheEntry = {
              alternatives: data.alternatives || [],
              recommendation: data.recommendation || '',
            };
            // Update local reactive state immediately
            comp.aiCache = { ...comp.aiCache, [optType]: cacheEntry };
            // Prepare Firestore write (dotted path to avoid overwriting other types)
            firestoreUpdate[`aiCache.${optType}`] = {
              ...cacheEntry,
              cachedAt: serverTimestamp(),
            };
          }

          // Write to Firestore in the background (don't block UI)
          updateDoc(doc(db, 'users', this.uid, 'subscriptions', analysis.subId), firestoreUpdate).catch(
            (err) => console.error('Cache write failed for', analysis.subId, err),
          );
        }
      }
    },

    getUserWidth(item) {
      const max = Math.max(item.userPrice, item.benchmarkPrice);
      if (max === 0) return 0;
      return (item.userPrice / max) * 100;
    },

    getBenchmarkWidth(item) {
      const max = Math.max(item.userPrice, item.benchmarkPrice);
      if (max === 0) return 0;
      return (item.benchmarkPrice / max) * 100;
    },

    toggleOption(key) {
      this.enabledOptions[key] = !this.enabledOptions[key];
    },

    toggleCard(id) {
      const idx = this.openCards.indexOf(id);
      if (idx === -1) {
        this.openCards.push(id);
      } else {
        this.openCards.splice(idx, 1);
      }
    },

    // True if any enabled option type has cached data for this subscription
    hasResultsForComp(comp) {
      return OPTION_LIST.some(
        (opt) => this.enabledOptions[opt.key] && comp.aiCache?.[opt.key],
      );
    },

    // True if this specific card is currently being loaded (part of an active batch)
    isCompLoading(comp) {
      if (!this.aiLoading && !this.autoRunning) return false;
      return OPTION_LIST.some(
        (opt) => this.enabledOptions[opt.key] && !comp.aiCache?.[opt.key],
      );
    },

    // Max savings across all enabled+cached types for a subscription
    bestSavingsForComp(comp) {
      let best = 0;
      for (const opt of OPTION_LIST) {
        if (!this.enabledOptions[opt.key] || !comp.aiCache?.[opt.key]) continue;
        for (const alt of comp.aiCache[opt.key].alternatives || []) {
          if ((alt.savingsPerMonth || 0) > best) best = alt.savingsPerMonth;
        }
      }
      return best;
    },

    // Recommendation from the type with highest savings (falls back to competitors)
    bestRecommendationForComp(comp) {
      let best = null;
      let bestSavings = -1;
      for (const opt of OPTION_LIST) {
        if (!this.enabledOptions[opt.key] || !comp.aiCache?.[opt.key]) continue;
        const rec = comp.aiCache[opt.key].recommendation;
        const maxSav = Math.max(
          0,
          ...(comp.aiCache[opt.key].alternatives || []).map((a) => a.savingsPerMonth || 0),
        );
        if (maxSav > bestSavings) {
          bestSavings = maxSav;
          best = rec;
        }
      }
      return best;
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

.card-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}

.price-good { color: #16a34a; }
.price-bad  { color: #dc2626; }

/* ── Chart ── */
.chart-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.chart-header { margin-bottom: 20px; }

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

.chart-row { display: flex; flex-direction: column; }

.chart-label {
  font-size: 0.8rem;
  margin-bottom: 4px;
}

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

.user-bar      { background: #6c47ff; }
.benchmark-bar { background: #10b981; }

/* ── Table ── */
.table-section {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 24px;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f5;
}

.table-title {
  font-size: 1rem;
  font-weight: 700;
}

.table-wrapper { overflow-x: auto; }

.sub-table {
  width: 100%;
  border-collapse: collapse;
}

.sub-table thead tr { background: #fafafa; }

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

.sub-row { border-bottom: 1px solid #f9f9fb; }

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
  flex-shrink: 0;
}

.service-avatar--sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.service-name { font-weight: 600; }

.category-tag {
  background: #f4f4f8;
  color: #6b7080;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
}

.cost-cell { font-weight: 600; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-badge--excellent { background: #f0fdf4; color: #16a34a; }
.status-badge--fair      { background: #fff7ed; color: #ea580c; }
.status-badge--poor      { background: #fef2f2; color: #dc2626; }

/* ── AI Section ── */
.ai-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Controls card */
.ai-controls-card {
  background: linear-gradient(135deg, #6c47ff 0%, #8b5cf6 100%);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.controls-heading {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  display: block;
  margin-bottom: 2px;
}

.controls-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.ai-controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Toggle pills */
.toggle-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.toggle-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
}

.toggle-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.toggle-pill--active {
  background: #fff;
  color: #6c47ff;
  border-color: #fff;
}

/* Analyse button */
.btn-analyse {
  background: #fff;
  color: #6c47ff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.btn-analyse:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-analyse:not(:disabled):hover {
  opacity: 0.9;
}

/* Spinners */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #6c47ff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.spinner--sm {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  border-color: rgba(255,255,255,0.6);
  border-top-color: transparent;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Status hints */
.ai-status-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #6b7080;
  padding: 2px 0;
}

/* Error banner */
.ai-error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.ai-error-dismiss {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 4px;
}

/* Results title */
.ai-results-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

/* AI cards */
.ai-card {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.ai-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}

.ai-card-header:hover,
.ai-card-header--loading {
  background: #fafafa;
}

.ai-card-header--loading {
  cursor: default;
}

.ai-card-service {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-card-name {
  font-weight: 700;
  font-size: 0.92rem;
  display: block;
}

.ai-card-current {
  font-size: 0.76rem;
  color: #6b7080;
}

.ai-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.ai-savings-pill {
  background: #f0fdf4;
  color: #16a34a;
  font-size: 0.73rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.ai-chevron {
  font-size: 1.4rem;
  color: #9ca3af;
  transition: transform 0.2s;
  display: inline-block;
  line-height: 1;
}

.ai-chevron--open { transform: rotate(90deg); }

/* Card body */
.ai-card-body {
  border-top: 1px solid #f0f0f5;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Type sections */
.type-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-badge--competitors  { background: #f5f3ff; color: #6c47ff; }
.type-badge--student      { background: #eff6ff; color: #2563eb; }
.type-badge--family       { background: #f0fdf4; color: #16a34a; }
.type-badge--cheaper_tier { background: #f3f4f6; color: #6b7080; }

.type-not-fetched {
  font-size: 0.78rem;
  color: #9ca3af;
  font-style: italic;
}

/* Alternative rows */
.alt-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  border-bottom: 1px solid #f9f9fb;
}

.alt-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.alt-left {
  flex: 1;
  min-width: 140px;
}

.alt-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.alt-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
}

.alt-price {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a2e;
}

.alt-save {
  font-size: 0.76rem;
  font-weight: 600;
  color: #16a34a;
}

.alt-note {
  width: 100%;
  font-size: 0.76rem;
  color: #6b7080;
  margin: 1px 0 0;
}

.alt-empty {
  font-size: 0.82rem;
  color: #9ca3af;
  font-style: italic;
  padding: 4px 0;
}

/* Recommendation */
.ai-recommendation {
  background: #f5f3ff;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.84rem;
  color: #4c1d95;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.rec-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

/* Empty state */
.ai-empty {
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 28px 24px;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7080;
}
</style>
