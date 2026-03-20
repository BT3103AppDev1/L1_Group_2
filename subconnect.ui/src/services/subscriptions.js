// src/services/db.js
// Firestore helpers for SubConnect
//
// Data model:
//   users/{userId}/subscriptions/{subId}
//   {
//     serviceName, category, billingAmount, billingCycle,
//     startDate, nextBillingDate, status, notes, createdAt
//   }

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { createAlert } from './alerts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Reference to a user's subscriptions subcollection */
function subsRef(userId) {
  return collection(db, 'users', userId, 'subscriptions');
}

/** Reference to a single subscription document */
function subDocRef(userId, subId) {
  return doc(db, 'users', userId, 'subscriptions', subId);
}

/** Reference to the top-level user document */
function userDocRef(userId) {
  return doc(db, 'users', userId);
}

// ─── Computed helper ─────────────────────────────────────────────────────────

/**
 * Normalise any subscription's cost to a monthly figure.
 * Annual billing → divide by 12.
 */
export function toMonthlyCost(sub) {
  const amount = Number(sub.billingAmount);
  return sub.billingCycle === 'Annually' ? amount / 12 : amount;
}

// ─── User document ───────────────────────────────────────────────────────────

/**
 * Creates the top-level user document if it doesn't exist yet.
 * Safe to call on every login (merge: true won't overwrite existing data).
 */
export async function createUserDocument(userId, data = {}) {
  await setDoc(
    userDocRef(userId),
    { createdAt: serverTimestamp(), ...data },
    { merge: true },
  );
}

// ─── Budget ──────────────────────────────────────────────────────────────────

/** Get the user's monthly budget cap. Returns null if not set. */
export async function getBudget(userId) {
  const snap = await getDoc(userDocRef(userId));
  if (!snap.exists()) return null;
  return snap.data().budgetCap ?? null;
}

/** Set or update the user's monthly budget cap. */
export async function setBudget(userId, amount) {
  const newAmount = Number(amount);
  await setDoc(
    userDocRef(userId),
    { budgetCap: newAmount },
    { merge: true },
  );

  await checkBudgetAndTriggerAlert(userId);
}
// ─── Subscriptions CRUD ──────────────────────────────────────────────────────

/**
 * Fetch all subscriptions for a user, ordered by creation date (newest first).
 * Returns an array of { id, ...data } objects.
 */
export async function getSubscriptions(userId) {
  const q = query(subsRef(userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Add a new subscription.
 * @param {string} userId
 * @param {Object} sub - subscription fields
 * @returns {string} the new document ID
 */
export async function addSubscription(userId, sub) {
  const docRef = await addDoc(subsRef(userId), {
    serviceName: sub.serviceName,
    category: sub.category || '',
    billingAmount: Number(sub.billingAmount),
    billingCycle: sub.billingCycle || 'Monthly',
    startDate: sub.startDate || '',
    nextBillingDate: sub.nextBillingDate || '',
    status: sub.status || 'Active',
    notes: sub.notes || '',
    createdAt: serverTimestamp(),
  });
  await checkBudgetAndTriggerAlert(userId);
  return docRef.id;
}

/**
 * Update an existing subscription (partial update).
 * @param {string} userId
 * @param {string} subId
 * @param {Object} updates - fields to update
 */
export async function updateSubscription(userId, subId, updates) {
  const payload = { ...updates };
  if (payload.billingAmount !== undefined) {
    payload.billingAmount = Number(payload.billingAmount);
  }
  await updateDoc(subDocRef(userId, subId), payload);
  await checkBudgetAndTriggerAlert(userId);
}

/**
 * Delete a subscription document.
 */
export async function deleteSubscription(userId, subId) {
  await deleteDoc(subDocRef(userId, subId));
  await checkBudgetAndTriggerAlert(userId);
}

async function checkBudgetAndTriggerAlert(userId) {
  console.log("Running budget check...");

  const budget = await getBudget(userId);
  console.log("Budget from DB:", budget);

  if (budget === null || budget === undefined) {
    console.log("No budget set, exiting");
    return;
  }

  const subs = await getSubscriptions(userId);
  console.log("Subscriptions:", subs);

  const monthlyTotal = subs.reduce(
    (sum, sub) => sum + toMonthlyCost(sub),
    0
  );

  console.log("Monthly total:", monthlyTotal);

  if (monthlyTotal > Number(budget)) {
    console.log("Budget exceeded. Creating alert...");

    await createAlert(userId, {
      title: 'Budget Exceeded',
      message: `You have spent $${monthlyTotal.toFixed(2)} which exceeds your budget of $${budget}.`,
      type: 'budget',
      severity: 'warning'
    });
  } else {
    console.log("Budget not exceeded.");
  }
}
