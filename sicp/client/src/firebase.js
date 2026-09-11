import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const STORAGE_KEY = "sicp_firebase_config";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAnxHrcxyzVqrpSGYf18ojRcqW_TCUr178",
  authDomain: "sih-2026-49669.firebaseapp.com",
  projectId: "sih-2026-49669",
  storageBucket: "sih-2026-49669.firebasestorage.app",
  messagingSenderId: "166885645215",
  appId: "1:166885645215:web:1cd71f8a602fcf515b3baa",
  measurementId: "G-MLHZ8NXE9Q",
};

// Read Firebase config from environment variables, localStorage, or defaults
export function getFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  };

  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed?.apiKey) return { ...envConfig, ...parsed };
    }
  } catch {
    // ignore json error
  }

  return envConfig;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error("Failed to save Firebase config:", e);
  }
}

export function isFirebaseConfigured() {
  const cfg = getFirebaseConfig();
  return !!(cfg.apiKey && cfg.projectId && cfg.apiKey.length > 10);
}

let firebaseApp = null;
let firebaseAuth = null;

export function getFirebaseAuth() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey) return null;

  if (!firebaseApp) {
    const apps = getApps();
    firebaseApp = apps.length > 0 ? apps[0] : initializeApp(cfg);
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

// Google Sign In with forced account chooser ('select_account')
export async function signInWithGoogleViaFirebase() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase is not yet configured with an API key.");
  }
  const provider = new GoogleAuthProvider();
  // 'select_account' forces Google to display all signed-in Google accounts on the system
  provider.setCustomParameters({
    prompt: "select_account",
  });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return {
    email: user.email,
    name: user.displayName || user.email?.split("@")[0] || "Google User",
    photoUrl: user.photoURL || null,
    uid: user.uid,
    idToken: await user.getIdToken(),
  };
}

