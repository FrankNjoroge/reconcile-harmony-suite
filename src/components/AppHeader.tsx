
import React from 'react';
import { Menu, Zap, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { useReconciliation } from '@/contexts/ReconciliationContext';

interface AppHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasUnviewedResults, markResultsAsViewed } = useReconciliation();

  const handleNotificationClick = () => {
    markResultsAsViewed();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/insights':
        return 'Insights';
      case '/reports':
        return 'Reports';
      case '/activity':
        return 'Activity Log';
      case '/settings':
        return 'Settings';
      case '/help':
        return 'Help & Support';
      default:
        return 'Transactron';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Menu and Brand */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Transactron
              </h1>
              <p className="text-xs text-muted-foreground">Professional Edition</p>
            </div>
          </div>
        </div>

        {/* Center section - Current Page Title */}
        <div className="hidden md:flex items-center">
          <h2 className="text-lg font-semibold text-foreground">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right section - User Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <NotificationDropdown 
            hasNotification={hasUnviewedResults}
            onNotificationClick={handleNotificationClick}
          />
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
