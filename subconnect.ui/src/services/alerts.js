import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore"

import { db } from "../firebase"

// Get alerts
export const getAlerts = async (userId) => {
  const snapshot = await getDocs(
    collection(db, `users/${userId}/alerts`)
  )

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Create alert
export const createAlert = async (userId, data) => {
  await addDoc(collection(db, `users/${userId}/alerts`), {
    ...data,
    read: false,
    createdAt: serverTimestamp()
  })
}

export const deleteAlert = async (userId, alertId) => {
  const alertRef = doc(db, `users/${userId}/alerts/${alertId}`)
  await deleteDoc(alertRef)
}

export const markAlertAsRead = async (userId, alertId) => {
  const alertRef = doc(db, `users/${userId}/alerts/${alertId}`)
  await updateDoc(alertRef, {
    read: true
  })
}

export const markAllAlertsAsRead = async (userId) => {
  const snapshot = await getDocs(
    collection(db, `users/${userId}/alerts`)
  )

  const updates = snapshot.docs.map(docSnap =>
    updateDoc(docSnap.ref, { read: true })
  )

  await Promise.all(updates)
}