import React from 'react';
import Layout from './components/Layout';
import Wizard from './components/Wizard';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout>
      <Image src="/images/logo.png" alt="Travereel Logo" width={300} height={300} className="mx-auto mb-8" />
      <h1 className="text-4xl font-bold text-center my-8"></h1>
      <Wizard />
    </Layout>
  );
}