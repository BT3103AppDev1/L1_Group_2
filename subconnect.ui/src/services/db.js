// src/services/db.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase"; // Import the initialized Firestore instance

//  Add a new subscription
export async function addSubscription(userId, subData) {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      userId: userId, // Link this sub to the specific logged-in user
      serviceName: subData.serviceName,
      category: subData.category,
      cost: Number(subData.cost), // Ensure cost is saved as a number for dashboard math
      billingCycle: subData.billingCycle, // e.g., 'monthly' or 'yearly'
      nextBillingDate: Timestamp.fromDate(new Date(subData.nextBillingDate)),
      createdAt: Timestamp.now()
    });
    console.log("Subscription added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding subscription: ", error);
    throw error;
  }
}

//  Fetch all user's subs
export async function getUserSubscriptions(userId) {
  try {
    // Only fetch documents where the userId matches the currently logged-in user
    const q = query(collection(db, "subscriptions"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const subscriptions = [];
    querySnapshot.forEach((doc) => {
      // Push each document ID and its data into our array
      subscriptions.push({ id: doc.id, ...doc.data() });
    });
    
    return subscriptions;
  } catch (error) {
    console.error("Error getting subscriptions: ", error);
    throw error;
  }
}

//  Edit an existing sub
export async function updateSubscription(subId, updatedData) {
  try {
    // Locate the specific document by its unique ID
    const subRef = doc(db, "subscriptions", subId);
    
    // Update it with whatever new data is passed in (e.g., price changed)
    await updateDoc(subRef, updatedData);
    console.log("Subscription updated successfully");
  } catch (error) {
    console.error("Error updating subscription: ", error);
    throw error;
  }
}

//  Remove a subscription
export async function deleteSubscription(subId) {
  try {
    const subRef = doc(db, "subscriptions", subId);
    await deleteDoc(subRef);
    console.log("Subscription deleted successfully");
  } catch (error) {
    console.error("Error deleting subscription: ", error);
    throw error;
  }
}