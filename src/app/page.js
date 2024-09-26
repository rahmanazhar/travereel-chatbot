import React from 'react';
import Layout from './components/Layout';
import Wizard from './components/Wizard';

export default function Home() {
  return (
    <Layout>
      <h1 className="text-4xl font-bold text-center my-8">Welcome to Travereel</h1>
      <Wizard />
    </Layout>
  );
}