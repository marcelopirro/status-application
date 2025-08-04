import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUcXQlFe-QeeAwXiAcrosWLieEB9jxhyc",
  authDomain: "contact-database-9d4b1.firebaseapp.com",
  projectId: "contact-database-9d4b1",
  storageBucket: "contact-database-9d4b1.firebasestorage.app",
  messagingSenderId: "86550563182",
  appId: "1:86550563182:web:838d2fb2ff25d49317597f",
  measurementId: "G-4EN9EZJ70V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db};