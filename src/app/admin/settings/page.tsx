'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Eye, EyeOff } from 'lucide-react';

interface Settings {
  adminPassword: string;
  notionApiKey: string;
  notionDatabaseId: string;
  upsApiKey: string;
  upsUsername: string;
  upsPassword: string;
  upsAccountNumber: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    adminPassword: '',
    notionApiKey: '',
    notionDatabaseId: '',
    upsApiKey: '',
    upsUsername: '',
    upsPassword: '',
    upsAccountNumber: '',
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage API keys and configuration</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Admin Password */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Authentication</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.adminPassword ? 'text' : 'password'}
                  value={settings.adminPassword}
                  onChange={(e) => updateSetting('adminPassword', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900"
                  placeholder="Enter new admin password (leave blank to keep current)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('adminPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.adminPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep the current password unchanged
              </p>
            </div>
          </div>

          {/* Notion Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notion Integration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notion API Key
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.notionApiKey ? 'text' : 'password'}
                    value={settings.notionApiKey}
                    onChange={(e) => updateSetting('notionApiKey', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900"
                    placeholder="secret_..."
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('notionApiKey')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.notionApiKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notion Database ID
                </label>
                <input
                  type="text"
                  value={settings.notionDatabaseId}
                  onChange={(e) => updateSetting('notionDatabaseId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  placeholder="Database ID"
                />
              </div>
            </div>
          </div>

          {/* UPS Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">UPS API Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPS API Key
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.upsApiKey ? 'text' : 'password'}
                    value={settings.upsApiKey}
                    onChange={(e) => updateSetting('upsApiKey', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900"
                    placeholder="API Key"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('upsApiKey')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.upsApiKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPS Username
                </label>
                <input
                  type="text"
                  value={settings.upsUsername}
                  onChange={(e) => updateSetting('upsUsername', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPS Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.upsPassword ? 'text' : 'password'}
                    value={settings.upsPassword}
                    onChange={(e) => updateSetting('upsPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('upsPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.upsPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPS Account Number
                </label>
                <input
                  type="text"
                  value={settings.upsAccountNumber}
                  onChange={(e) => updateSetting('upsAccountNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  placeholder="Account Number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

