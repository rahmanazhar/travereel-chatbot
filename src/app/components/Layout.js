import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
     
      <main className="w-[90%] mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}