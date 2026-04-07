import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVn2bW9tHmaW4i4AJRKyOL2WY8XIUHjWM",
  authDomain: "ai-resume-analyzer-b336c.firebaseapp.com",
  projectId: "ai-resume-analyzer-b336c",
  storageBucket: "ai-resume-analyzer-b336c.firebasestorage.app",
  messagingSenderId: "226182775851",
  appId: "1:226182775851:web:1fcbcca754cd0a87bf966e",
  measurementId: "G-PK7MF3980C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (app.name && typeof window !== 'undefined') {
  // eslint-disable-next-line no-unused-vars
  const analytics = getAnalytics(app);
}
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  if (name) {
    await updateProfile(user, { displayName: name });
  }
  return user;
};

export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const signOutUser = async () => {
  return signOut(auth);
};