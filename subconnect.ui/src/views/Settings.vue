<template>
  <div class="settings-container">
    <div class="settings-card">
      <h2 class="settings-title">Settings</h2>

      <!-- ── Currency ───────────────────────────────── -->
      <section class="settings-section">
        <h3 class="section-heading">Currency</h3>
        <p class="section-sub">
          Sets the currency symbol shown across the app and tells the AI which country's pricing to use for comparisons.
        </p>

        <div class="form-group">
          <label>Home Currency</label>
          <select v-model="selectedCurrency" class="settings-select">
            <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
              {{ c.symbol }} — {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- ── Notifications ──────────────────────────── -->
      <section class="settings-section">
        <h3 class="section-heading">Notifications</h3>
        <p class="section-sub">Control how SubConnect alerts you about renewals and budget limits.</p>

        <div class="toggle-row">
          <div>
            <p class="toggle-label">Email Notifications</p>
            <p class="toggle-sub">Receive renewal and budget alerts by email.</p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--on': emailNotifications }"
            @click="emailNotifications = !emailNotifications"
            :aria-label="emailNotifications ? 'Disable email notifications' : 'Enable email notifications'"
          >
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- ── Save ───────────────────────────────────── -->
      <button class="save-btn" :disabled="saving" @click="saveSettings">
        {{ saving ? 'Saving…' : 'Save Settings' }}
      </button>

      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { getPreferences } from '@/services/preferences';
import { CURRENCIES, loadCurrency, saveCurrency, currentCurrency } from '@/composables/useCurrency';
import { updatePreferences } from '@/services/preferences';

const auth = getAuth();

const selectedCurrency    = ref('SGD');
const emailNotifications  = ref(true);
const saving              = ref(false);
const successMsg          = ref('');
const errorMsg            = ref('');

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  await loadCurrency(user.uid);
  selectedCurrency.value = currentCurrency.value;

  const prefs = await getPreferences(user.uid);
  emailNotifications.value = prefs.emailNotifications ?? true;
});

async function saveSettings() {
  const user = auth.currentUser;
  if (!user) return;

  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    await saveCurrency(user.uid, selectedCurrency.value);
    await updatePreferences(user.uid, { emailNotifications: emailNotifications.value });
    successMsg.value = 'Settings saved successfully!';
  } catch (err) {
    console.error('Failed to save settings:', err);
    errorMsg.value = 'Failed to save settings. Please try again.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings-container {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.settings-card {
  background: white;
  width: 100%;
  max-width: 520px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.settings-title {
  margin: 0 0 2rem;
  color: #1a1a2e;
  font-size: 1.5rem;
  font-weight: 700;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.section-sub {
  font-size: 0.83rem;
  color: #6b7080;
  margin: 0;
  line-height: 1.5;
}

.section-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 1.75rem 0;
}

/* Form elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #444;
}

.settings-select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #fff;
  cursor: pointer;
  color: #1a1a2e;
}

.settings-select:focus {
  outline: none;
  border-color: #6c47ff;
  box-shadow: 0 0 0 2px rgba(108, 71, 255, 0.2);
}

/* Toggle */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 2px;
}

.toggle-sub {
  font-size: 0.78rem;
  color: #6b7080;
  margin: 0;
}

.toggle-btn {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.toggle-btn--on {
  background: #6c47ff;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  display: block;
}

.toggle-btn--on .toggle-thumb {
  transform: translateX(20px);
}

/* Save */
.save-btn {
  width: 100%;
  padding: 0.85rem;
  background: #6c47ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #5a3bc2;
}

.save-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.success-msg {
  color: #16a34a;
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-msg {
  color: #dc2626;
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}
</style>
