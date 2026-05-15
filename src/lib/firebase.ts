import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { useVoiceStore } from '../store/voiceStore';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalForceLongPolling to improve connectivity in restricted networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Enable Offline Persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth Error:", error);
    throw error;
  }
};

// Connection test
async function testConnection() {
  const store = useVoiceStore.getState();
  try {
    // Attempt to fetch a document from the server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Interface: Neural uplink established.");
    store.setUplinkStable(true);
    // Briefly show stability if state allows
    if (store.state === 'IDLE') {
      store.setErrorMessage("Neural Uplink 100% Stable");
      setTimeout(() => store.setErrorMessage(null), 3000);
    }
  } catch (error: any) {
    console.error("Firebase Connection Error:", error.message);
    store.setUplinkStable(false);
    if (!navigator.onLine) {
      console.error("Uplink Failure: Node is currently offline.");
    } else {
      console.error("Uplink Failure: Could not reach Firestore backend. Protocol 11-B suggests relay reset.");
    }
  }
}
testConnection();
