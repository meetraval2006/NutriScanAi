
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/scanner'); 
    } catch (error: any) {
      alert(`Sign Up failed: ${error.message}`);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/scanner'); 
    } catch (error: any) {
      alert(`Google sign up failed: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      {/* Email and Password Signup */}
      <input
        type="email"
        value={email}
        placeholder="Email"
        className="border p-2 w-full mb-2 text-center"
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <input
        type="password"
        value={password}
        placeholder="Password"
        className="border p-2 w-full mb-4 text-center"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleEmailSignUp}>Sign Up</button>
      
      <div className='mb-4 text-center'>or</div>
     
      {/* Google Sign Up */}
      <div className='text-center'>
      <button
        className="bg-red-600 px-4 py-2 rounded"
        onClick={handleGoogleSignUp}
      >
        Sign Up with Google
      </button>
      </div>
    </div>
  );
}
