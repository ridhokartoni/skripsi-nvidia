'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  CogIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  containerDefaults: {
    maxCPU: number;
    maxRAM: number;
    maxGPU: number;
    defaultImage: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireMFA: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    adminEmail: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'security' | 'notifications' | 'maintenance'>('system');
  
  const [settings, setSettings] = useState<SystemSettings>({
    containerDefaults: {
      maxCPU: 8,
      maxRAM: 32,
      maxGPU: 2,
      defaultImage: 'ubuntu:latest'
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireMFA: false
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      adminEmail: 'admin@example.com'
    },
    maintenance: {
      enabled: false,
      message: 'System is under maintenance. Please try again later.'
    }
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/login');
      return;
    }
    // Load settings from localStorage or API
    loadSettings();
  }, [user, router]);

  const loadSettings = () => {
    // In a real app, this would fetch from an API
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to an API
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'system', label: 'System', icon: ServerIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'maintenance', label: 'Maintenance', icon: CogIcon }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Container Defaults</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum CPU Cores
                  </label>
                  <input
                    type="number"
                    value={settings.containerDefaults.maxCPU}
                    onChange={(e) => handleInputChange('containerDefaults', 'maxCPU', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum RAM (GB)
                  </label>
                  <input
                    type="number"
                    value={settings.containerDefaults.maxRAM}
                    onChange={(e) => handleInputChange('containerDefaults', 'maxRAM', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum GPU Units
                  </label>
                  <input
                    type="number"
                    value={settings.containerDefaults.maxGPU}
                    onChange={(e) => handleInputChange('containerDefaults', 'maxGPU', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Container Image
                  </label>
                  <input
                    type="text"
                    value={settings.containerDefaults.defaultImage}
                    onChange={(e) => handleInputChange('containerDefaults', 'defaultImage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireMFA"
                    checked={settings.security.requireMFA}
                    onChange={(e) => handleInputChange('security', 'requireMFA', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireMFA" className="ml-2 block text-sm text-gray-900">
                    Require Multi-Factor Authentication for all users
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={settings.notifications.emailEnabled}
                    onChange={(e) => handleInputChange('notifications', 'emailEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable Email Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsEnabled"
                    checked={settings.notifications.smsEnabled}
                    onChange={(e) => handleInputChange('notifications', 'smsEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable SMS Notifications
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notification Email
                  </label>
                  <input
                    type="email"
                    value={settings.notifications.adminEmail}
                    onChange={(e) => handleInputChange('notifications', 'adminEmail', e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Mode</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceEnabled"
                    checked={settings.maintenance.enabled}
                    onChange={(e) => handleInputChange('maintenance', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable Maintenance Mode
                  </label>
                </div>
                
                {settings.maintenance.enabled && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ When maintenance mode is enabled, users will not be able to access the platform.
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenance.message}
                    onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
