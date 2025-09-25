import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { TourDetailPage } from './pages/TourDetailPage';
import { AuthModal } from './modals/AuthModal';
import { GuideSignupModal } from './modals/GuideSignupModal';
import { HikerRegistrationModal } from './modals/HikerRegistrationModal';
import { UserDashboard } from './pages/UserDashboard';
import { GuideDashboard } from './pages/GuideDashboard';
import { BookingFlow } from './pages/BookingFlow';
import { PendingBookingFlow } from './pages/PendingBookingFlow';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerificationFlow } from './pages/VerificationFlow';
import { DecisionManager } from './DecisionManager';
import { WireframePreloader } from './WireframePreloader';
import { WireframeNotification } from './WireframeNotification';
import { WireframeDesign } from './WireframeDesign';
import { Footer } from './layout/Footer';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { type Page, type User, type Tour, type SearchFilters } from '../types';
import { Toaster } from './ui/sonner';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
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
  const [wireframeDecisions, setWireframeDecisions] = useState<any>(null);
  const [pendingBookingEmail, setPendingBookingEmail] = useState<string | null>(null);
  
  const { user: authUser, signOut, loading } = useAuth();
  const { profile } = useProfile();

  // Use profile as the user data throughout the app, fallback to authUser for booking flow
  const user = profile || (authUser && authUser.email_confirmed_at ? {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || authUser.email || '',
    role: (authUser.user_metadata?.role || 'hiker') as 'hiker' | 'guide' | 'admin',
    verified: false
  } as User : null);

  useEffect(() => {
    // Load wireframe decisions
    const savedDecisions = localStorage.getItem('madetohike-wireframe-decisions');
    if (savedDecisions) {
      try {
        setWireframeDecisions(JSON.parse(savedDecisions));
      } catch (e) {
        console.error('Failed to load wireframe decisions:', e);
      }
    }
  }, []);

  const handleGuideSignup = (userData: User) => {
    setShowGuideSignupModal(false);
    // The guide signup will be handled by the GuideSignupModal with real Supabase auth
  };

  const handleHikerRegistration = (userData: User) => {
    setShowHikerRegistrationModal(false);
    // The hiker registration will be handled by the HikerRegistrationModal with real Supabase auth
  };

  const handleLogout = async () => {
    await signOut();
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

  const handleApplyDecisions = (decisions: any) => {
    setWireframeDecisions(decisions);
    if (decisions) {
      console.log('Applied wireframe decisions:', decisions);
      // Here you would apply the decisions to customize the marketplace
      // This could involve updating design tokens, feature flags, etc.
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onNavigateToSearch={navigateToSearch}
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
      case 'pending-booking':
        return selectedTour && pendingBookingEmail ? (
          <PendingBookingFlow
            tour={selectedTour}
            userEmail={pendingBookingEmail}
            onVerified={() => {
              setPendingBookingEmail(null);
              setCurrentPage('booking');
            }}
            onCancel={() => {
              setPendingBookingEmail(null);
              setCurrentPage('tour-detail');
            }}
          />
        ) : null;
      case 'settings':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Marketplace Settings</h1>
              <DecisionManager onApplyDecisions={handleApplyDecisions} />
            </div>
          </div>
        );
      case 'wireframe':
        return <WireframeDesign />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Auto-load wireframe decisions */}
      <WireframePreloader />

      {/* Global Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('landing')}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,6L10.25,11L14,16L15.5,14.5L13.25,11L15.5,7.5L14,6M9.5,6L8,7.5L10.25,11L8,14.5L9.5,16L13.25,11L9.5,6Z"/>
                <path d="M4.5,3C3.67,3 3,3.67 3,4.5V19.5C3,20.33 3.67,21 4.5,21H19.5C20.33,21 21,20.33 21,19.5V4.5C21,3.67 20.33,3 19.5,3H4.5Z"/>
              </svg>
              <div>
                <div className="text-lg font-semibold">MadeToHike</div>
                <div className="text-xs text-muted-foreground">Guided Adventures</div>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {currentPage !== 'search' && (
                <button
                  onClick={() => navigateToSearch()}
                  className="text-sm hover:text-primary"
                >
                  Find Tours
                </button>
              )}

              <button
                onClick={() => setCurrentPage('settings')}
                className="text-sm hover:text-primary"
              >
                Settings
              </button>

              <button
                onClick={() => setCurrentPage('wireframe')}
                className="text-sm hover:text-primary"
              >
                Wireframes
              </button>

              {user && user.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('admin-dashboard')}
                  className="text-sm hover:text-primary"
                >
                  Admin Panel
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={navigateToDashboard}
                    className="text-sm hover:text-primary"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth?mode=signin"
                    className="text-sm hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="text-sm hover:text-primary mr-2"
                  >
                    Sign Up
                  </Link>
                  <button
                    onClick={() => setShowGuideSignupModal(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
                  >
                    Become a Guide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{renderCurrentPage()}</main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
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
          onRegister={(data) => {
            handleHikerRegistration(data);
            // Store email for pending booking flow
            if (data?.email) {
              setPendingBookingEmail(data.email);
            }
            setShowHikerRegistrationModal(false);
            setCurrentPage('pending-booking');
          }}
          tourTitle={selectedTour.title}
        />
      )}

      {/* Wireframe Decisions Notification */}
      <WireframeNotification />

      {/* Footer */}
      <Footer 
        onNavigate={(page: string) => setCurrentPage(page as Page)}
        onNavigateToSearch={navigateToSearch}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default function MadeToHikeApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}