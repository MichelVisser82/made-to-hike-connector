import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { TourDetailPage } from './pages/TourDetailPage';
import { AuthModal } from './modals/AuthModal';
import { GuideSignupModal } from './modals/GuideSignupModal';
import { HikerRegistrationModal } from './modals/HikerRegistrationModal';
import { UserDashboard } from './pages/UserDashboard';
import { GuideDashboard } from './pages/GuideDashboard';
import { BookingFlow } from './pages/BookingFlow';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerificationFlow } from './pages/VerificationFlow';
import { Navigation } from './layout/Navigation';
import { type Page, type User, type Tour, type SearchFilters } from '../types';

export default function MadeToHikeApp() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideSignupModal, setShowGuideSignupModal] = useState(false);
  const [showHikerRegistrationModal, setShowHikerRegistrationModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    region: '',
    difficulty: '',
    dateRange: '',
    maxPrice: ''
  });

  // Mock user authentication - in real app this would use Supabase auth
  useEffect(() => {
    const savedUser = localStorage.getItem('madetohike-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize sample users for testing
    const sampleUsers = [
      {
        id: 'admin',
        email: 'admin@madetohike.com',
        name: 'Admin User',
        role: 'admin',
        verified: true,
        verification_status: 'approved'
      },
      {
        id: 'guide1',
        email: 'marco@alpineguides.com',
        name: 'Marco Alpine',
        role: 'guide',
        verified: false,
        verification_status: 'pending',
        business_info: {
          company_name: 'Alpine Adventures Italy',
          license_number: 'IT-AG-2024-001',
          insurance_info: 'Professional Liability: €2M, Public Liability: €5M',
          experience_years: 8
        }
      },
      {
        id: 'guide2',
        email: 'sarah@scotlandtreks.co.uk',
        name: 'Sarah Mountain',
        role: 'guide',
        verified: false,
        verification_status: 'pending',
        business_info: {
          company_name: 'Scotland Highland Treks',
          license_number: 'UK-SHT-2024-002',
          insurance_info: 'Professional Indemnity: £3M, Public Liability: £6M',
          experience_years: 12
        }
      }
    ];

    const existingUsers = localStorage.getItem('madetohike-users');
    if (!existingUsers) {
      localStorage.setItem('madetohike-users', JSON.stringify(sampleUsers));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('madetohike-user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleGuideSignup = (userData: User) => {
    setUser(userData);
    localStorage.setItem('madetohike-user', JSON.stringify(userData));
    setShowGuideSignupModal(false);
  };

  const handleHikerRegistration = (userData: User) => {
    setUser(userData);
    localStorage.setItem('madetohike-user', JSON.stringify(userData));
    setShowHikerRegistrationModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('madetohike-user');
    setCurrentPage('landing');
  };

  const navigateToSearch = (filters = {}) => {
    setSearchFilters({ ...searchFilters, ...filters });
    setCurrentPage('search');
  };

  const navigateToTour = (tour: Tour) => {
    setSelectedTour(tour);
    setCurrentPage('tour-detail');
  };

  const navigateToBooking = (tour: Tour) => {
    setSelectedTour(tour);
    if (!user) {
      setShowHikerRegistrationModal(true);
    } else {
      setCurrentPage('booking');
    }
  };

  const navigateToDashboard = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (user.role === 'guide') {
      setCurrentPage('guide-dashboard');
    } else {
      setCurrentPage('user-dashboard');
    }
  };

  const navigateToVerification = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage('verification');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onNavigateToSearch={navigateToSearch}
            onShowAuth={() => setShowAuthModal(true)}
            onShowGuideSignup={() => setShowGuideSignupModal(true)}
            user={user}
            onNavigateToDashboard={navigateToDashboard}
          />
        );
      case 'search':
        return (
          <SearchPage
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            onTourClick={navigateToTour}
            onBookTour={navigateToBooking}
          />
        );
      case 'tour-detail':
        return selectedTour ? (
          <TourDetailPage
            tour={selectedTour}
            onBookTour={navigateToBooking}
            onBackToSearch={() => setCurrentPage('search')}
          />
        ) : null;
      case 'user-dashboard':
        return user ? (
          <UserDashboard
            user={user}
            onNavigateToSearch={navigateToSearch}
            onTourClick={navigateToTour}
          />
        ) : null;
      case 'guide-dashboard':
        return user ? (
          <GuideDashboard
            user={user}
            onTourClick={navigateToTour}
            onStartVerification={navigateToVerification}
          />
        ) : null;
      case 'admin-dashboard':
        return user && user.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : null;
      case 'verification':
        return user && user.role === 'guide' ? (
          <VerificationFlow
            user={user}
            onComplete={() => setCurrentPage('guide-dashboard')}
            onCancel={() => setCurrentPage('guide-dashboard')}
          />
        ) : null;
      case 'booking':
        return selectedTour && user ? (
          <BookingFlow
            tour={selectedTour}
            user={user}
            onComplete={() => setCurrentPage('user-dashboard')}
            onCancel={() => setCurrentPage('tour-detail')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage}
        user={user}
        onNavigate={setCurrentPage}
        onNavigateToSearch={navigateToSearch}
        onNavigateToDashboard={navigateToDashboard}
        onShowAuth={() => setShowAuthModal(true)}
        onShowGuideSignup={() => setShowGuideSignupModal(true)}
        onLogout={handleLogout}
      />

      <main>{renderCurrentPage()}</main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {showGuideSignupModal && (
        <GuideSignupModal
          onClose={() => setShowGuideSignupModal(false)}
          onSignup={handleGuideSignup}
        />
      )}

      {showHikerRegistrationModal && selectedTour && (
        <HikerRegistrationModal
          onClose={() => {
            setShowHikerRegistrationModal(false);
            setSelectedTour(null);
          }}
          onRegister={(user) => {
            handleHikerRegistration(user);
            setShowHikerRegistrationModal(false);
            setCurrentPage('booking');
          }}
          tourTitle={selectedTour.title}
        />
      )}
    </div>
  );
}