// src/services/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase"; // Importing the auth instance we set up earlier



// login
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Success! Logged in as:", user.email);
    return user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error; // Throws error for frontend (e.g., "Invalid email or password")
  }
}


// registration
export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Success! Account created for:", user.email);
    return user; 
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error; // Throws the error so the frontend can display it (e.g., "Password too weak")
  }
}