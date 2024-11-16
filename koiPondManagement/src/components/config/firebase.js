// Import các functions cần thiết
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Thêm dòng này

// Firebase configuration
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
const analytics = getAnalytics(app);
const storage = getStorage(app); // Thêm dòng này

// Tạo và cấu hình Google Provider
export const googleProvider = new GoogleAuthProvider();
// Thêm các scopes cần thiết
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// Cấu hình thêm (optional)
googleProvider.setCustomParameters({
  prompt: 'select_account' // Luôn hiện dialog chọn account
});

export { app, analytics, storage }; // Thêm storage vào exports
export default app;