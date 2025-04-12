// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6fsY_GrydxBqra5lAHpu2QOHY5A_oAaA",
  authDomain: "badger-passport-app.firebaseapp.com",
  projectId: "badger-passport-app",
  storageBucket: "badger-passport-app.firebasestorage.app",
  messagingSenderId: "916681697254",
  appId: "1:916681697254:web:00203346be83cdb1f81827",
  measurementId: "G-HLT7XRTM22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);np