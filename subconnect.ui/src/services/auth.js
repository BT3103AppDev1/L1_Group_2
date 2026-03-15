import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,     
  signInWithPopup         
} from "firebase/auth";
import { auth } from "../firebase"; 

const googleProvider = new GoogleAuthProvider();

// login function
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

// NEW: Google Sign-In function
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Success! Logged in with Google as:", result.user.email);
    return result.user;
  } catch (error) {
    console.error("Google Login Error:", error.message);
    throw error; 
  }
}

// register function
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

// logout function
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("Success! User logged out.");
  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
}

// password reset function
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Success! Password reset email sent to:", email);
  } catch (error) {
    console.error("Password Reset Error:", error.message);
    throw error; // Throws error so frontend can show "Email not found" etc.
  }
}