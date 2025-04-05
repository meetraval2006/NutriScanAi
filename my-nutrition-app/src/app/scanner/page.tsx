'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ScannerPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push('/login'); // not logged in, redirect to login
      }
    });
  }, []);

  const handleLogout = () => {
    signOut(auth);
    router.push('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome, {user.email}</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded mb-6"
      >
        Log Out
      </button>

      {/* OCR upload and Gemini analysis will go here */}
    </div>
  );
}
