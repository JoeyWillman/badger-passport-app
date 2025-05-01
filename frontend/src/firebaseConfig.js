// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbKm00OgjspICmEAdRgJ8_SeQbExXwbPA",
  authDomain: "badger-passport.firebaseapp.com",
  projectId: "badger-passport",
  storageBucket: "badger-passport.firebasestorage.app",
  messagingSenderId: "756824705680",
  appId: "1:756824705680:web:0714ca9090df4ba201e615",
  measurementId: "G-N62FH9RCY0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
