// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9NLf1WKSmAzx4gdJ8MBTqiA5ZFWMkr2M",
  authDomain: "login-c8d8e.firebaseapp.com",
  projectId: "login-c8d8e",
  storageBucket: "login-c8d8e.appspot.com",
  messagingSenderId: "740648825310",
  appId: "1:740648825310:web:ac5edc6ab944c32aec6d4f",
  measurementId: "G-YRMX1Q0VBM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { storage, googleProvider };