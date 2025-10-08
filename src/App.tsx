import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

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