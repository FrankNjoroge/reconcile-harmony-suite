
import React from 'react';
import { Menu, Sparkles, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from './ThemeToggle';

interface AppHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
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
          
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Reconciliation Suite
              </h1>
              <p className="text-xs text-muted-foreground">Professional Edition</p>
            </div>
          </div>
        </div>

        {/* Center section - Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" size="sm" className="text-primary font-medium">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            Reports
          </Button>
        </nav>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon">
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
