import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    window.scrollTo(0, 0);
    navigate(`/?page=${page}`);
  };

  const handleNavigateToSearch = (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value as string);
      });
    }
    window.scrollTo(0, 0);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavigation />
      <main className="flex-1">{children}</main>
      <Footer 
        onNavigate={handleNavigate}
        onNavigateToSearch={handleNavigateToSearch}
      />
    </div>
  );
}
