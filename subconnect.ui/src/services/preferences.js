import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

// Get preferences
export const getPreferences = async (userId) => {
  const ref = doc(db, `users/${userId}/settings/preferences`)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data()
  }

  // Default values if none exist
  const defaults = {
    emailNotifications: true,
    budgetThreshold: 500,
    updatedAt: serverTimestamp()
  }

  await setDoc(ref, defaults)
  return defaults
}

// Update preferences
export const updatePreferences = async (userId, updates) => {
  const ref = doc(db, `users/${userId}/settings/preferences`)
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}