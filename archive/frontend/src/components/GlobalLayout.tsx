import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface GlobalLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export default function GlobalLayout({ children, showBottomNav = true }: GlobalLayoutProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark flex min-h-screen w-full items-start justify-center">
      {/* Main App Frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white dark:bg-black overflow-hidden shadow-2xl">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        
        {/* Fixed Bottom Navigation */}
        {showBottomNav && <BottomNavigation />}
      </div>
    </div>
  );
}
