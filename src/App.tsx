import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LaunchGate } from "@/components/pre-launch/LaunchGate";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PageLoader } from "@/components/common/PageLoader";
import { AnalyticsLoader } from "@/components/common/AnalyticsLoader";

// Eager loads (frequently accessed public pages)
import Index from "./pages/Index";
import ToursPage from "./pages/ToursPage";
import { Auth } from "./pages/Auth";

// Lazy loads (protected and deep pages)
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TourCreationPage = lazy(() => import("./pages/TourCreationPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TourPage = lazy(() => import("./pages/TourPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const GuideSignupPage = lazy(() => import("./pages/GuideSignupPage"));
const GuidesPage = lazy(() => import("./pages/GuidesPage"));
const CertificationsPage = lazy(() => import("./pages/CertificationsPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const ParticipantPage = lazy(() => import("./pages/ParticipantPage"));
const JoinPage = lazy(() => import("./pages/JoinPage").then(m => ({ default: m.JoinPage })));
const GuideJoinPage = lazy(() => import("./pages/GuideJoinPage").then(m => ({ default: m.GuideJoinPage })));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail").then(m => ({ default: m.VerifyEmail })));
const BookingFlowNew = lazy(() => import("./components/pages/BookingFlowNew").then(m => ({ default: m.BookingFlowNew })));
const BookingSuccess = lazy(() => import("./components/pages/BookingSuccess").then(m => ({ default: m.BookingSuccess })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const OfferAccept = lazy(() => import("./pages/OfferAccept"));
const OfferDecline = lazy(() => import("./pages/OfferDecline"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EmailTest = lazy(() => import("./components/EmailTest").then(m => ({ default: m.EmailTest })));

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/auth?mode=signin" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnalyticsLoader />
          <AuthProvider>
            <LaunchGate>
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/join" element={<Suspense fallback={<PageLoader />}><JoinPage /></Suspense>} />
            <Route path="/guides/join" element={<Suspense fallback={<PageLoader />}><GuideJoinPage /></Suspense>} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
            <Route path="/email-test" element={<Suspense fallback={<PageLoader />}><EmailTest /></Suspense>} />
            <Route path="/tours/:tourSlug/book" element={<Suspense fallback={<PageLoader />}><BookingFlowNew /></Suspense>} />
            <Route path="/tours/:slug" element={<Suspense fallback={<PageLoader />}><TourPage /></Suspense>} />
            <Route path="/guides" element={<Suspense fallback={<PageLoader />}><GuidesPage /></Suspense>} />
            <Route path="/guide/signup" element={<Suspense fallback={<PageLoader />}><GuideSignupPage /></Suspense>} />
            <Route path="/certifications" element={<Suspense fallback={<PageLoader />}><CertificationsPage /></Suspense>} />
            <Route path="/booking-success" element={<Suspense fallback={<PageLoader />}><BookingSuccess /></Suspense>} />
            <Route path="/payment-success" element={<Suspense fallback={<PageLoader />}><PaymentSuccess /></Suspense>} />
            <Route path="/payment-canceled" element={<Suspense fallback={<PageLoader />}><PaymentCanceled /></Suspense>} />
            <Route path="/offer/accept" element={<Suspense fallback={<PageLoader />}><OfferAccept /></Suspense>} />
            <Route path="/offer/decline" element={<Suspense fallback={<PageLoader />}><OfferDecline /></Suspense>} />
            <Route path="/help" element={<Suspense fallback={<PageLoader />}><HelpPage /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} />
            <Route path="/cookies" element={<Suspense fallback={<PageLoader />}><CookiesPage /></Suspense>} />
            <Route path="/participant/:token" element={<Suspense fallback={<PageLoader />}><ParticipantPage /></Suspense>} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings/*" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
                <Route 
                  path="/tour-creation" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <TourCreationPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/bookings/:bookingId" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/bookings/tour/:tourSlug" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/trip/:bookingId" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                {/* Dynamic guide profile route - BEFORE NotFound */}
                <Route path="/:slug" element={<Suspense fallback={<PageLoader />}><GuidePage /></Suspense>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
              </Routes>
            </LaunchGate>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;