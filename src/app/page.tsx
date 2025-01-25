'use client';

import { useState } from 'react';
import SignIn from './signin/page';
import Dashboard from './dashboard/page';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <SignIn />
      )}
    </div>
  );
}
