// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCRr-LX_VRgkOWad1BGHwGZhWnijmjIht8",
    authDomain: "nutriscanai-f5471.firebaseapp.com",
    projectId: "nutriscanai-f5471",
    storageBucket: "nutriscanai-f5471.firebasestorage.app",
    messagingSenderId: "1058733503231",
    appId: "1:1058733503231:web:84e21c2f402deb964612ca"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
