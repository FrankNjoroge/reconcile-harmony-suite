
import React from 'react';
import { X, FileSpreadsheet, TrendingUp, Clock, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReconciliation } from '@/contexts/ReconciliationContext';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentResults, activityLog } = useReconciliation();
  
  const menuItems = [
    { icon: FileSpreadsheet, label: 'Dashboard', path: '/', badge: null },
    { icon: TrendingUp, label: 'Insights', path: '/insights', badge: currentResults ? 'Ready' : null },
    { icon: BarChart3, label: 'Reports', path: '/reports', badge: currentResults ? 'Analytics' : null },
    { icon: Clock, label: 'Activity Log', path: '/activity', badge: activityLog.length > 0 ? activityLog.length.toString() : null },
    { icon: Settings, label: 'Settings', path: '/settings', badge: null },
    { icon: HelpCircle, label: 'Help & Support', path: '/help', badge: null },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-background border-r z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive: navIsActive }) => `
                  flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${navIsActive || isActive(item.path)
                    ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:shadow-sm'
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs animate-fade-in">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Quick Stats Card */}
          <div className="p-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-medium text-sm mb-2">Latest Session</h3>
              {currentResults ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Files Processed:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matches Found:</span>
                    <span className="font-medium text-green-600">{currentResults.summary.matched}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match Rate:</span>
                    <span className="font-medium">
                      {((currentResults.summary.matched / currentResults.summary.totalInternal) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Files Processed:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ready to start</span>
                    <span className="font-medium text-blue-600">Upload files</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
