// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0bYG2yBCgap3Ov7AT_Vp9h1RSTYOxx-8",
  authDomain: "ehbdata.firebaseapp.com",
  projectId: "ehbdata",
  storageBucket: "ehbdata.firebasestorage.app",
  messagingSenderId: "970410423416",
  appId: "1:970410423416:web:a32b39ce0b554daae4698d",
  measurementId: "G-3NM1W6ZQWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics conditionally (only if supported)
let analytics = null;
isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);

// Initialize Storage
const storage = getStorage(app);

export { db, auth, analytics, storage, GoogleAuthProvider, signInWithPopup }; 