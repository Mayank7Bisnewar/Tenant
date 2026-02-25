import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBkWDLbqcCMTWYh4ge1lYZ3hnT-8lD2VOw",
    authDomain: "tenant-backup2026.firebaseapp.com",
    projectId: "tenant-backup2026",
    storageBucket: "tenant-backup2026.firebasestorage.app",
    messagingSenderId: "196000772262",
    appId: "1:196000772262:web:5edcf1af962bab854d8467",
    measurementId: "G-CCCHY1VK4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { auth, db, googleProvider, analytics };
