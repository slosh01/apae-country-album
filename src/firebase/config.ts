import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import configUrl from "../../firebase-applet-config.json";

// Explicitly define the database ID
const DATABASE_ID = "ai-studio-4fb6c331-3f82-4556-b021-8a1d48099556";

const app = getApps().length === 0 ? initializeApp(configUrl) : getApps()[0];

// Use getFirestore with the databaseId as the second argument
// This is the standard way to connect to a named database
const db = getFirestore(app, DATABASE_ID);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

console.log("Firestore target database:", DATABASE_ID);

export { app, db, auth, googleProvider };
