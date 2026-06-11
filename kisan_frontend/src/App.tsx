import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { getProfile } from "@/lib/storage";
import { LanguageProvider } from "@/lib/i18n";
import { useState } from "react";
import { FloatingMic } from "./components/FloatingMic";
import { ChatPopup } from "./components/ChatPopup";
import { TopNavbar } from "./components/TopNavbar";
import { BottomNavbar } from "./components/BottomNavbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Marketplace from "./pages/Marketplace";
import Schemes from "./pages/Schemes";
import HelpAndHistory from "./pages/HelpAndHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthFlow from "./pages/AuthFlow";
import { Navbar } from "./components/Navbar";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const profile = getProfile();
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const ProtectedLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = (file: File) => {
    navigate('/diagnosis', { state: { file } });
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopNavbar />
      <div className="flex flex-1 w-full">
        <Navbar />
        <main className="flex-1 relative pb-20 lg:pb-0">
          <Outlet />
          
          {/* Floating mic for desktop - bottom right */}
          <div className="hidden lg:block">
            <FloatingMic 
              onClick={() => setIsChatOpen(true)}
              hasMessages={false}
            />
          </div>
          
          <ChatPopup
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onImageUpload={handleImageUpload}
          />
        </main>
      </div>

      {/* Bottom navbar for mobile/tablet with mic in center */}
      <BottomNavbar onMicClick={() => setIsChatOpen(true)} />
    </div>
  );
};

const PublicLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleImageUpload = (file: File) => {
    navigate('/diagnosis', { state: { file } });
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopNavbar />
      <main className="flex-1 relative">
        <Outlet />
        
        {/* Floating mic for public pages - bottom right on all screens */}
        <FloatingMic 
          onClick={() => setIsChatOpen(true)}
          hasMessages={false}
        />
        
        <ChatPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onImageUpload={handleImageUpload}
        />
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes with TopNavbar and floating mic */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<AuthFlow />} />
            </Route>
            
            {/* Protected routes with TopNavbar, Sidebar (desktop), and BottomNavbar (mobile) */}
            <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/market" element={<Marketplace />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/help" element={<HelpAndHistory />} />
              <Route path="/history" element={<HelpAndHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
