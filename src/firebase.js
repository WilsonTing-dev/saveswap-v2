import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBsAru_44DAxk2VCTCnhygqAReO_HUM_8",
  authDomain: "saveswap-af1be.firebaseapp.com",
  projectId: "saveswap-af1be",
  storageBucket: "saveswap-af1be.firebasestorage.app",
  messagingSenderId: "355875943913",
  appId: "1:355875943913:web:5d9c62e5ba5ecd0d7d4778",
  measurementId: "G-MCDVS4Y6PD",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
