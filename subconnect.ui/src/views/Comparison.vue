<template>
  <div class="comparison">

    <!-- ── Page header ───────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Comparison</h1>
        <p class="page-subtitle">Compare your subscriptions side by side.</p>
      </div>
    </div>

    <!-- ── Content goes here ─────────────────────────────────────── -->

  </div>
</template>

<script setup>
</script>

<style scoped>
.comparison {
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
</style>
