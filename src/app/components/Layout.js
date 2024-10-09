import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-custom">
      <main className="w-[90%] mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
