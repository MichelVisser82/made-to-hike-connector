import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { TourCreationFlow } from './tour-creation/TourCreationFlow';
import { GuideProfilePageWrapper } from './pages/GuideProfilePageWrapper';
import { CertificationsContent } from './pages/CertificationsContent';
import { AppNavigation } from './layout/AppNavigation';
import { Footer } from './layout/Footer';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { type Page, type User, type Tour, type SearchFilters } from '../types';
import { Toaster } from './ui/sonner';

function AppContent() {
  const navigate = useNavigate();
  
  // Check URL for page parameter
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page') as Page | null;
  
  const [currentPage, setCurrentPage] = useState<Page>(pageParam || 'landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideSignupModal, setShowGuideSignupModal] = useState(false);
  const [showHikerRegistrationModal, setShowHikerRegistrationModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [tourToCopy, setTourToCopy] = useState<Tour | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | undefined>(undefined);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    region: '',
    difficulty: '',
    dateRange: '',
    maxPrice: ''
  });
  const [pendingBookingEmail, setPendingBookingEmail] = useState<string | null>(null);
  const [viewingGuideId, setViewingGuideId] = useState<string | null>(null);
  
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


  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user && currentPage === 'landing') {
      navigateToDashboard();
    }
  }, [user, loading, currentPage]);

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
    window.scrollTo(0, 0);
    setSearchFilters({ ...searchFilters, ...filters });
    setCurrentPage('search');
  };

  const navigateToTour = (tour: Tour) => {
    setSelectedTour(tour);
    setCurrentPage('tour-detail');
  };

  const navigateToBooking = (tour: Tour) => {
    setSelectedTour(tour);
    if (!user && !authUser) {
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

  const navigateToTourCreation = (tourData?: Tour, isEditMode?: boolean) => {
    if (!user || user.role !== 'guide') {
      return;
    }
    if (!user.verified) {
      navigateToVerification();
      return;
    }
    setTourToCopy(tourData);
    setIsEditMode(isEditMode || false);
    setCurrentPage('tour-creation');
  };

  const navigateToGuideProfile = (guideId: string) => {
    setViewingGuideId(guideId);
    setCurrentPage('guide-profile');
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
            onCreateTour={navigateToTourCreation}
            onEditTour={(tour) => {
              setTourToCopy(tour);
              setIsEditMode(true);
              setEditingTourId(tour.id);
              setCurrentPage('tour-creation');
            }}
            onNavigateToGuideProfile={navigateToGuideProfile}
          />
        ) : null;
      case 'guide-profile':
        return viewingGuideId ? (
          <GuideProfilePageWrapper 
            guideId={viewingGuideId}
            onNavigateBack={() => setCurrentPage('guide-dashboard')}
          />
        ) : null;
      case 'tour-creation':
        return user && user.role === 'guide' && user.verified ? (
          <TourCreationFlow
            onComplete={() => {
              setTourToCopy(undefined);
              setIsEditMode(false);
              setEditingTourId(undefined);
              setCurrentPage('guide-dashboard');
            }}
            onCancel={() => {
              setTourToCopy(undefined);
              setIsEditMode(false);
              setEditingTourId(undefined);
              setCurrentPage('guide-dashboard');
            }}
            initialData={tourToCopy}
            editMode={isEditMode}
            tourId={editingTourId}
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
        return selectedTour && (user || authUser) ? (
          <BookingFlow
            tour={selectedTour}
            user={user || {
              id: authUser!.id,
              email: authUser!.email || '',
              name: authUser!.user_metadata?.name || authUser!.email || '',
              role: (authUser!.user_metadata?.role || 'hiker') as 'hiker' | 'guide' | 'admin',
              verified: !!authUser!.email_confirmed_at
            } as User}
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
      case 'certifications':
        return <CertificationsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <AppNavigation 
        onDashboardClick={navigateToDashboard}
        onSearchClick={() => navigateToSearch()}
        currentPage={currentPage}
      />

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
            setShowHikerRegistrationModal(false);
            // Immediately proceed to booking after registration
            setCurrentPage('booking');
          }}
          tourTitle={selectedTour.title}
        />
      )}

      {/* Footer */}
      <Footer 
        onNavigate={(page: string) => {
          window.scrollTo(0, 0);
          setCurrentPage(page as Page);
        }}
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