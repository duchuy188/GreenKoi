
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: "AIzaSyBfpiAMItKVvI6rxxhfnMnBxe27kIk2LPQ",
  authDomain: "koigreen-33857.firebaseapp.com",
  projectId: "koigreen-33857",
  storageBucket: "koigreen-33857.appspot.com",
  messagingSenderId: "376166148727",
  appId: "1:376166148727:web:db627a8cfcdaa90b18b472",
  measurementId: "G-C4N0X34N2C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
