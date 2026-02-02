// src/auth.js
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function register(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Create a basic user profile in Firestore (users/{uid})
  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      email: cred.user.email,
      displayName: "",
      photoURL: "",
      createdAt: serverTimestamp(),
      role: "user",
    },
    { merge: true }
  );

  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
