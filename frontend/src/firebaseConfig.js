// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA6fsY_GrydxBqra5lAHpu2QOHY5A_oAaA",
  authDomain: "badger-passport-app.firebaseapp.com",
  projectId: "badger-passport-app",
  storageBucket: "badger-passport-app.firebasestorage.app",
  messagingSenderId: "916681697254",
  appId: "1:916681697254:web:00203346be83cdb1f81827",
  measurementId: "G-HLT7XRTM22"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth };
