import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LaunchGate } from "@/components/pre-launch/LaunchGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TourPage from "./pages/TourPage";
import GuidePage from "./pages/GuidePage";
import GuideSignupPage from "./pages/GuideSignupPage";
import GuidesPage from "./pages/GuidesPage";
import { EmailTest } from "./components/EmailTest";
import { Auth } from "./pages/Auth";
import { VerifyEmail } from "./pages/VerifyEmail";
import CertificationsPage from "./pages/CertificationsPage";
import DashboardPage from "./pages/DashboardPage";
import TourCreationPage from "./pages/TourCreationPage";
import ProfilePage from "./pages/ProfilePage";
import { BookingDetailPage } from "./components/dashboard/BookingDetailPage";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
          <AuthProvider>
            <LaunchGate>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/email-test" element={<EmailTest />} />
                <Route path="/tours/:slug" element={<TourPage />} />
                <Route path="/guides" element={<GuidesPage />} />
                <Route path="/guide/signup" element={<GuideSignupPage />} />
                <Route path="/certifications" element={<CertificationsPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tour-creation" 
                  element={
                    <ProtectedRoute>
                      <TourCreationPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/booking/:bookingId" 
                  element={
                    <ProtectedRoute>
                      <BookingDetailPage />
                    </ProtectedRoute>
                  } 
                />
                {/* Dynamic guide profile route - BEFORE NotFound */}
                <Route path="/:slug" element={<GuidePage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LaunchGate>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;