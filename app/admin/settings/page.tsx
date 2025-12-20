'use client';

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Users,
  Shield,
  Bell,
  Palette,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  AlertTriangle,
  Check,
  Info,
  Database,
  Trash2,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type SettingsTab = 'general' | 'users' | 'security' | 'notifications' | 'appearance' | 'advanced';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onToggle, label, description }: ToggleSwitchProps) {
  return (
    <div className="settings-toggle-row">
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-description">{description}</span>}
      </div>
      <button className={`toggle-switch ${enabled ? 'enabled' : ''}`} onClick={onToggle}>
        {enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  // General Settings State
  const [siteName, setSiteName] = useState('Pokemon TCG Forum');
  const [siteDescription, setSiteDescription] = useState('The ultimate community for Pokemon TCG collectors and players');
  const [siteUrl, setSiteUrl] = useState('https://pokemon-tcg-forum.vercel.app');
  const [contactEmail, setContactEmail] = useState('admin@pokemontcg.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // User Settings State
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [defaultUserRole, setDefaultUserRole] = useState('member');
  const [minUsernameLength, setMinUsernameLength] = useState(3);
  const [maxUsernameLength, setMaxUsernameLength] = useState(20);
  const [allowAvatarUpload, setAllowAvatarUpload] = useState(true);

  // Security Settings State
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(15);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [requireStrongPassword, setRequireStrongPassword] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);
  const [apiKey] = useState('pk_live_xxxxxxxxxxxxxxxxxxxxx');

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserNotification, setNewUserNotification] = useState(true);
  const [reportNotification, setReportNotification] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Appearance Settings State
  const [primaryColor, setPrimaryColor] = useState('#FFCC00');
  const [darkMode, setDarkMode] = useState(true);
  const [showOnlineUsers, setShowOnlineUsers] = useState(true);
  const [showForumStats, setShowForumStats] = useState(true);
  const [threadsPerPage, setThreadsPerPage] = useState(25);
  const [postsPerPage, setPostsPerPage] = useState(20);

  // Advanced Settings State
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Globe },
    { id: 'users' as SettingsTab, label: 'Users', icon: Users },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
    { id: 'advanced' as SettingsTab, label: 'Advanced', icon: Database },
  ];

  return (
    <div className="admin-settings">
      {/* Header */}
      <div className="admin-settings-header">
        <div className="settings-title">
          <Settings className="w-6 h-6" />
          <h2>Settings</h2>
        </div>
        <div className="settings-actions">
          <button className="admin-btn secondary" onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            className={`admin-btn primary ${saveStatus === 'saving' ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <>Saving...</>
            ) : saveStatus === 'saved' ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Site Information</h3>
              <div className="settings-field">
                <label>Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Enter site name"
                />
              </div>
              <div className="settings-field">
                <label>Site Description</label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
              <div className="settings-field">
                <label>Site URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="settings-field">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="settings-group">
              <h3>Site Status</h3>
              <ToggleSwitch
                enabled={maintenanceMode}
                onToggle={() => setMaintenanceMode(!maintenanceMode)}
                label="Maintenance Mode"
                description="When enabled, only admins can access the site"
              />
              {maintenanceMode && (
                <div className="settings-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Site is currently in maintenance mode. Regular users cannot access the forum.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Settings */}
        {activeTab === 'users' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Registration Settings</h3>
              <ToggleSwitch
                enabled={allowRegistration}
                onToggle={() => setAllowRegistration(!allowRegistration)}
                label="Allow New Registrations"
                description="Enable or disable new user sign-ups"
              />
              <ToggleSwitch
                enabled={emailVerification}
                onToggle={() => setEmailVerification(!emailVerification)}
                label="Require Email Verification"
                description="Users must verify their email before posting"
              />
              <div className="settings-field">
                <label>Default User Role</label>
                <select value={defaultUserRole} onChange={(e) => setDefaultUserRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="verified">Verified Member</option>
                  <option value="trusted">Trusted Member</option>
                </select>
              </div>
            </div>

            <div className="settings-group">
              <h3>Username Requirements</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Minimum Length</label>
                  <input
                    type="number"
                    value={minUsernameLength}
                    onChange={(e) => setMinUsernameLength(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
                <div className="settings-field">
                  <label>Maximum Length</label>
                  <input
                    type="number"
                    value={maxUsernameLength}
                    onChange={(e) => setMaxUsernameLength(Number(e.target.value))}
                    min={10}
                    max={50}
                  />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3>Profile Settings</h3>
              <ToggleSwitch
                enabled={allowAvatarUpload}
                onToggle={() => setAllowAvatarUpload(!allowAvatarUpload)}
                label="Allow Avatar Uploads"
                description="Users can upload custom profile pictures"
              />
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Login Protection</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                    min={3}
                    max={10}
                  />
                </div>
                <div className="settings-field">
                  <label>Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    value={lockoutDuration}
                    onChange={(e) => setLockoutDuration(Number(e.target.value))}
                    min={5}
                    max={60}
                  />
                </div>
              </div>
              <div className="settings-field">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min={15}
                  max={1440}
                />
                <span className="field-hint">How long until inactive users are logged out</span>
              </div>
            </div>

            <div className="settings-group">
              <h3>Password Requirements</h3>
              <ToggleSwitch
                enabled={requireStrongPassword}
                onToggle={() => setRequireStrongPassword(!requireStrongPassword)}
                label="Require Strong Passwords"
                description="Minimum 8 characters with uppercase, lowercase, number, and symbol"
              />
              <ToggleSwitch
                enabled={enable2FA}
                onToggle={() => setEnable2FA(!enable2FA)}
                label="Enable Two-Factor Authentication"
                description="Allow users to enable 2FA for their accounts"
              />
            </div>

            <div className="settings-group">
              <h3>API Access</h3>
              <div className="settings-field">
                <label>API Key</label>
                <div className="api-key-field">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                  />
                  <button
                    className="api-key-toggle"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="field-hint">Use this key for API integrations</span>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Email Notifications</h3>
              <ToggleSwitch
                enabled={emailNotifications}
                onToggle={() => setEmailNotifications(!emailNotifications)}
                label="Enable Email Notifications"
                description="Send email notifications to admins"
              />
              {emailNotifications && (
                <>
                  <ToggleSwitch
                    enabled={newUserNotification}
                    onToggle={() => setNewUserNotification(!newUserNotification)}
                    label="New User Registration"
                    description="Notify when a new user registers"
                  />
                  <ToggleSwitch
                    enabled={reportNotification}
                    onToggle={() => setReportNotification(!reportNotification)}
                    label="Content Reports"
                    description="Notify when content is reported"
                  />
                </>
              )}
            </div>

            <div className="settings-group">
              <h3>Scheduled Reports</h3>
              <ToggleSwitch
                enabled={dailyDigest}
                onToggle={() => setDailyDigest(!dailyDigest)}
                label="Daily Activity Digest"
                description="Receive a daily summary of forum activity"
              />
              <ToggleSwitch
                enabled={weeklyReport}
                onToggle={() => setWeeklyReport(!weeklyReport)}
                label="Weekly Analytics Report"
                description="Receive weekly analytics and insights"
              />
            </div>

            <div className="settings-group">
              <h3>Email Configuration</h3>
              <div className="settings-info">
                <Info className="w-4 h-4" />
                <span>Email settings are configured via environment variables. Contact your system administrator to modify SMTP settings.</span>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Theme Settings</h3>
              <div className="settings-field">
                <label>Primary Color</label>
                <div className="color-picker-field">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#FFCC00"
                  />
                </div>
              </div>
              <ToggleSwitch
                enabled={darkMode}
                onToggle={() => setDarkMode(!darkMode)}
                label="Dark Mode Default"
                description="Use dark theme as the default for all users"
              />
            </div>

            <div className="settings-group">
              <h3>Forum Display</h3>
              <ToggleSwitch
                enabled={showOnlineUsers}
                onToggle={() => setShowOnlineUsers(!showOnlineUsers)}
                label="Show Online Users"
                description="Display online users widget on forum pages"
              />
              <ToggleSwitch
                enabled={showForumStats}
                onToggle={() => setShowForumStats(!showForumStats)}
                label="Show Forum Statistics"
                description="Display forum statistics on the homepage"
              />
            </div>

            <div className="settings-group">
              <h3>Pagination</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Threads Per Page</label>
                  <select value={threadsPerPage} onChange={(e) => setThreadsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Posts Per Page</label>
                  <select value={postsPerPage} onChange={(e) => setPostsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3>Performance</h3>
              <ToggleSwitch
                enabled={cacheEnabled}
                onToggle={() => setCacheEnabled(!cacheEnabled)}
                label="Enable Caching"
                description="Cache pages and queries for faster loading"
              />
              <ToggleSwitch
                enabled={debugMode}
                onToggle={() => setDebugMode(!debugMode)}
                label="Debug Mode"
                description="Show detailed error messages (development only)"
              />
              {debugMode && (
                <div className="settings-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Debug mode is enabled. Do not use in production!</span>
                </div>
              )}
            </div>

            <div className="settings-group">
              <h3>Backup & Data</h3>
              <ToggleSwitch
                enabled={autoBackup}
                onToggle={() => setAutoBackup(!autoBackup)}
                label="Automatic Backups"
                description="Automatically backup forum data"
              />
              {autoBackup && (
                <div className="settings-field">
                  <label>Backup Frequency</label>
                  <select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}
              <div className="settings-button-group">
                <button className="admin-btn secondary">
                  <Download className="w-4 h-4" /> Export Data
                </button>
                <button className="admin-btn secondary">
                  <Upload className="w-4 h-4" /> Import Data
                </button>
              </div>
            </div>

            <div className="settings-group danger">
              <h3>Danger Zone</h3>
              <div className="danger-zone">
                <div className="danger-item">
                  <div className="danger-info">
                    <span className="danger-title">Clear All Cache</span>
                    <span className="danger-description">Remove all cached data. This may temporarily slow down the site.</span>
                  </div>
                  <button className="admin-btn warning">
                    <Trash2 className="w-4 h-4" /> Clear Cache
                  </button>
                </div>
                <div className="danger-item">
                  <div className="danger-info">
                    <span className="danger-title">Reset Forum Statistics</span>
                    <span className="danger-description">Reset all view counts and statistics to zero.</span>
                  </div>
                  <button className="admin-btn danger">
                    <RotateCcw className="w-4 h-4" /> Reset Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
