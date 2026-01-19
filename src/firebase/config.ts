// Firebase 설정 파일
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정값
const firebaseConfig = {
  apiKey: "AIzaSyBmtr4gLqXtfYrwgXLIs4-GclohbfWE4r8",
  authDomain: "haru-63f18.firebaseapp.com",
  projectId: "haru-63f18",
  storageBucket: "haru-63f18.firebasestorage.app",
  messagingSenderId: "315479662217",
  appId: "1:315479662217:web:4a3f37d8a2c70559ba7058",
  measurementId: "G-B29300WEDC"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

