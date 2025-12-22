import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Home, Camera, TrendingUp, FileText, HelpCircle, User, Menu, X, LogOut, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getProfile } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/diagnosis', label: 'Crop Advisory', icon: Camera },
  { path: '/market', label: 'Market Prices', icon: TrendingUp },
  { path: '/schemes', label: 'Govt Schemes', icon: FileText },
  { path: '/history', label: 'Help & History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/landing');
  };

  const NavItem = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        onClick={() => mobile && setIsOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
          ${isActive 
            ? 'bg-primary text-primary-foreground shadow-md font-semibold' 
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }
          ${isCollapsed && !mobile ? 'justify-center' : ''}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {(!isCollapsed || mobile) && <span className="font-medium">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Navbar - Sidebar (no logo, integrated with top navbar) */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ 
          x: 0,
          width: isCollapsed ? '80px' : '256px'
        }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex flex-col bg-card border-r min-h-screen sticky top-16 shadow-lg"
      >
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full hover:bg-muted"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
