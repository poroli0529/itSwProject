// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH-6Sa3O0iJ5S5E5kvhH1qcrqKGgJsB-8",
  authDomain: "ilife-9326f.firebaseapp.com",
  projectId: "ilife-9326f",
  storageBucket: "ilife-9326f.appspot.com",
  messagingSenderId: "1067301976111",
  appId: "1:1067301976111:web:271e82e56c423d72de6eda",
  measurementId: "G-W2RVS0X99H"
};

const app = initializeApp(firebaseConfig);

// ✅ 이 두 줄 꼭 있어야 함
export const auth = getAuth(app);
export const db = getFirestore(app);
