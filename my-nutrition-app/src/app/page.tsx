// /app/login/page.tsx

'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/scanner'); // Redirect to scanner after successful login
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-2"
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-4"
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={handleLogin}
      >
        Log In
      </button>

      {/* Sign Up Button */}
      <p className="text-center">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="text-blue-500 hover:underline"
        >
          Sign Up
        </a>
      </p>
    </div>
  );
}
