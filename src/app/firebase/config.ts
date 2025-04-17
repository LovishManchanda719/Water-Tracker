// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKjsfiLZ7MtfLJvLrZ7yb2GyRtuYQZOGI",
  authDomain: "water-t-56581.firebaseapp.com",
  projectId: "water-t-56581",
  storageBucket: "water-t-56581.firebasestorage.app",
  messagingSenderId: "822363251561",
  appId: "1:822363251561:web:e39741bbc57dbc82cc53f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db }; 