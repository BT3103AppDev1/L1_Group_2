import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp
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