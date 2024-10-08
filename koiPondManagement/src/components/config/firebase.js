// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSk08DyIB_ybpN2RY9mcJyXQtgXhlZVHI",
  authDomain: "greenkoi-e5b59.firebaseapp.com",
  projectId: "greenkoi-e5b59",
  storageBucket: "greenkoi-e5b59.appspot.com",
  messagingSenderId: "685131223021",
  appId: "1:685131223021:web:fa598e7182b0d86e88e1e4",
  measurementId: "G-PDZE9X6SLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { storage, googleProvider };