'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { PipelineIndicator } from './PipelineIndicator';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidePipelineIndicator = pathname === '/' || pathname === '/planner' || pathname === '/login' || pathname === '/register';

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <Header />
      {!hidePipelineIndicator && <PipelineIndicator />}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <Footer />
    </div>
  );
}
