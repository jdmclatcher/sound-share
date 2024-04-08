import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, getApp, initializeApp } from "firebase/app";
import {
  EXPO_PUBLIC_API_KEY,
  EXPO_PUBLIC_AUTH_DOMAIN,
  EXPO_PUBLIC_PROJECT_ID,
  EXPO_PUBLIC_STORAGE_BUCKET,
  EXPO_PUBLIC_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_APP_ID,
  EXPO_PUBLIC_MEASUREMENT_ID,
} from "@env";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_API_KEY,
  authDomain: EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_APP_ID,
  measurementId: EXPO_PUBLIC_MEASUREMENT_ID,
};

let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  // initialize Firebase Auth for that app immediately
  initializeAuth(firebaseApp, {
    // use react native persistent storage to save user session
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  firebaseApp = getApp(); // if app already initialized, use that one
}

const db = getDatabase(firebaseApp);
// const auth = getAuth(firebaseApp);

// export { db as firebase, auth };
export { db as firebase };
