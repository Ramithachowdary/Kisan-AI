import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/lib/storage';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getProfile();
  const isAuthenticated = !!profile;
  
  // Pages where user is not logged in
  const publicPages = ['/', '/login', '/onboarding'];
  const isPublicPage = publicPages.includes(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left - Logo + App Name */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <span className="text-2xl">🌾</span>
          <span className="text-xl font-bold text-primary">Kisan+</span>
        </div>

        {/* Right - Auth buttons */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hover:bg-primary/10"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90"
              >
                Create Account
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="hover:bg-primary/10"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
