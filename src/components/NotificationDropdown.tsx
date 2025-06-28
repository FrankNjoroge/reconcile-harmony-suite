
import React, { useState } from 'react';
import { Bell, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useReconciliation } from '@/contexts/ReconciliationContext';

interface NotificationDropdownProps {
  hasNotification: boolean;
  onNotificationClick: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  hasNotification,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentResults } = useReconciliation();

  const handleViewInsights = () => {
    setIsOpen(false);
    onNotificationClick();
    navigate('/insights');
  };

  const handleToggle = () => {
    if (hasNotification) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={handleToggle}
        disabled={!hasNotification}
      >
        <Bell className="h-4 w-4" />
        {hasNotification && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse">
            1
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {isOpen && hasNotification && (
        <div className="absolute right-0 top-full mt-2 z-50 animate-in slide-in-from-top-2">
          <Card className="w-80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Reconciliation Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentResults && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transactions matched:</span>
                    <span className="font-medium text-green-600">
                      {currentResults.summary.matched}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match rate:</span>
                    <span className="font-medium">
                      {((currentResults.summary.matched / currentResults.summary.totalInternal) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleViewInsights}
                className="w-full mt-3"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
