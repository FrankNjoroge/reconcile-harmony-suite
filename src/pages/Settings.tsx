import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save, Download, Upload, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    autoExport: false,
    showAdvancedOptions: true,
    enableNotifications: true,
    matchThreshold: 0.01,
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('reconciliation-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reconciliation-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          toast({
            title: "Settings imported",
            description: "Settings have been imported successfully.",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Failed to import settings. Please check the file format.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-export">Auto Export Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically export results after reconciliation
                  </p>
                </div>
                <Switch
                  id="auto-export"
                  checked={settings.autoExport}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoExport: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="advanced-options">Show Advanced Options</Label>
                  <p className="text-sm text-muted-foreground">
                    Display advanced configuration options
                  </p>
                </div>
                <Switch
                  id="advanced-options"
                  checked={settings.showAdvancedOptions}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAdvancedOptions: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications for important events
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Processing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="match-threshold">Match Threshold</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Maximum difference allowed for amount matching ($)
                </p>
                <input
                  type="number"
                  id="match-threshold"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  value={settings.matchThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, matchThreshold: parseFloat(e.target.value) }))}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Preferred date format for exports and displays
                </p>
                <select
                  id="date-format"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  value={settings.dateFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Default currency for amount displays
                </p>
                <select
                  id="currency"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Settings Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </Button>
              
              <Button variant="outline" onClick={handleExportSettings} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Settings</span>
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Import Settings</span>
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Settings are automatically saved to your browser's local storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
