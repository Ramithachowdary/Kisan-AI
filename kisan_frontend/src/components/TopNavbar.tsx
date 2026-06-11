import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/lib/storage';
import { useLanguage, SUPPORTED_LANGUAGES, AppLanguage } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getProfile();
  const isAuthenticated = !!profile;
  const { t, language, setLanguage } = useLanguage();
  
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
          <span className="text-xl font-bold text-primary">{t('app_name')}</span>
        </div>

        {/* Right - Language Selector + Auth buttons */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title={t('language_selector_label')}
                className="hover:bg-primary/10"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang as AppLanguage)}
                  className={`cursor-pointer ${language === lang ? 'bg-primary/10 font-semibold' : ''}`}
                >
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hover:bg-primary/10"
              >
                {t('login')}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90"
              >
                {t('create_account')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="hover:bg-primary/10"
                title={t('profile')}
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
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
