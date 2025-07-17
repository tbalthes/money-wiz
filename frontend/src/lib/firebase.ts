// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_c50Vgw5uc0jYZoHUISInBSeaAalzilk",
  authDomain: "money-wiz-dbd34.firebaseapp.com",
  projectId: "money-wiz-dbd34",
  storageBucket: "money-wiz-dbd34.firebasestorage.app",
  messagingSenderId: "303363442024",
  appId: "1:303363442024:web:7a66c8d4a6499489c902dd",
  measurementId: "G-XMFYSYYNYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);