import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-appBg">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
