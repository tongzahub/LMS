'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  Palette,
  Puzzle,
  Mail,
  Database,
  Save,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  HardDrive,
  Cpu,
  Wifi,
  ToggleLeft,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ----------------------------------------------------------------
// Toggle Switch component
// ----------------------------------------------------------------
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

function ToggleSwitch({ id, checked, onChange, label, description, disabled }: ToggleSwitchProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-0.5 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-gray-900 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Section header helper
// ----------------------------------------------------------------
function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
  );
}

// ----------------------------------------------------------------
// Shared select styles
// ----------------------------------------------------------------
const SELECT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

// ----------------------------------------------------------------
// Tab definitions
// ----------------------------------------------------------------
type TabId = 'general' | 'security' | 'appearance' | 'plugins' | 'email' | 'backup';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'plugins', label: 'Plugins', icon: Puzzle },
  { id: 'email', label: 'Email & Notifications', icon: Mail },
  { id: 'backup', label: 'Backup & Maintenance', icon: Database },
];

// ----------------------------------------------------------------
// Plugin data
// ----------------------------------------------------------------
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'not-installed';
}

const INITIAL_PLUGINS: Plugin[] = [
  { id: 'h5p', name: 'H5P Interactive Content', description: 'Creates rich interactive content including quizzes, presentations, and games.', version: '1.22.3', status: 'active' },
  { id: 'bbb', name: 'BigBlueButton', description: 'Virtual classroom integration for live online sessions.', version: '2.5.0', status: 'active' },
  { id: 'turnitin', name: 'Turnitin', description: 'Plagiarism detection and academic integrity tool.', version: '2.9.7', status: 'inactive' },
  { id: 'scorm', name: 'SCORM Player', description: 'SCORM/xAPI content support for e-learning packages.', version: '5.3.1', status: 'active' },
  { id: 'certificate', name: 'Certificate', description: 'Custom certificate generation upon course completion.', version: '4.1.0', status: 'active' },
  { id: 'attendance', name: 'Attendance', description: 'Track and manage student attendance records.', version: '3.11.0', status: 'active' },
  { id: 'questionnaire', name: 'Questionnaire', description: 'Advanced surveys and feedback collection module.', version: '4.2.1', status: 'not-installed' },
  { id: 'quizventure', name: 'Quizventure', description: 'Gamified quiz experience with arcade-style gameplay.', version: '4.0.5', status: 'not-installed' },
  { id: 'levelup', name: 'Level Up!', description: 'Gamification with experience points (XP) and levels.', version: '3.9.0', status: 'inactive' },
  { id: 'analytics', name: 'Analytics Dashboard', description: 'Advanced learning analytics and reporting dashboard.', version: '2.6.2', status: 'active' },
];

// ----------------------------------------------------------------
// General Tab
// ----------------------------------------------------------------
interface GeneralState {
  siteName: string;
  siteUrl: string;
  language: string;
  timezone: string;
  yearFormat: string;
  maxUpload: string;
  courseFormat: string;
}

function GeneralTab() {
  const [form, setForm] = useState<GeneralState>({
    siteName: 'ECV Learning Solutions',
    siteUrl: 'https://lms.ecv.ac.th',
    language: 'th',
    timezone: 'Asia/Bangkok',
    yearFormat: 'BE',
    maxUpload: '100',
    courseFormat: 'topics',
  });

  const set = (key: keyof GeneralState, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Site Identity"
          description="Basic information about your LMS installation."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Site Name"
            value={form.siteName}
            onChange={(e) => set('siteName', e.target.value)}
          />
          <Input
            label="Site URL"
            type="url"
            value={form.siteUrl}
            onChange={(e) => set('siteUrl', e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Locale & Regional"
          description="Language, timezone, and date format preferences."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Language
            </label>
            <select
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              className={SELECT_CLS}
            >
              <option value="th">Thai (ภาษาไทย)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={form.timezone}
              onChange={(e) => set('timezone', e.target.value)}
              className={SELECT_CLS}
            >
              <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year Format
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {[{ val: 'BE', label: 'Buddhist Era (พ.ศ.)' }, { val: 'CE', label: 'Christian Era (ค.ศ.)' }].map(
                ({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('yearFormat', val)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.yearFormat === val
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Content Settings"
          description="Upload limits and default content configuration."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Upload Size
            </label>
            <select
              value={form.maxUpload}
              onChange={(e) => set('maxUpload', e.target.value)}
              className={SELECT_CLS}
            >
              {['10', '50', '100', '250', '500'].map((v) => (
                <option key={v} value={v}>
                  {v} MB
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Course Format
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {[{ val: 'topics', label: 'Topics' }, { val: 'weekly', label: 'Weekly' }].map(
                ({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('courseFormat', val)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.courseFormat === val
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <SaveBar />
    </div>
  );
}

// ----------------------------------------------------------------
// Security Tab
// ----------------------------------------------------------------
interface SecurityState {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  sessionTimeout: string;
  ipWhitelist: string;
  mfaRequired: boolean;
  maxLoginAttempts: number;
  captchaOnRegister: boolean;
}

function SecurityTab() {
  const [form, setForm] = useState<SecurityState>({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: false,
    sessionTimeout: '60',
    ipWhitelist: '',
    mfaRequired: false,
    maxLoginAttempts: 5,
    captchaOnRegister: true,
  });

  const toggle = (key: keyof SecurityState) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Password Policy"
          description="Define password complexity requirements for all user accounts."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Length
            </label>
            <input
              type="number"
              min={6}
              max={32}
              value={form.minPasswordLength}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, minPasswordLength: Number(e.target.value) }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <ToggleSwitch
            id="req-upper"
            checked={form.requireUppercase}
            onChange={() => toggle('requireUppercase')}
            label="Require Uppercase Letters"
            description="Password must contain at least one uppercase letter (A–Z)."
          />
          <ToggleSwitch
            id="req-numbers"
            checked={form.requireNumbers}
            onChange={() => toggle('requireNumbers')}
            label="Require Numbers"
            description="Password must contain at least one numeric digit (0–9)."
          />
          <ToggleSwitch
            id="req-special"
            checked={form.requireSpecial}
            onChange={() => toggle('requireSpecial')}
            label="Require Special Characters"
            description="Password must contain at least one special character (!@#$%^&*)."
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Session & Access"
          description="Control how long sessions stay active and restrict access by IP."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout
            </label>
            <select
              value={form.sessionTimeout}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sessionTimeout: e.target.value }))
              }
              className={SELECT_CLS}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Failed Login Attempts
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.maxLoginAttempts}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxLoginAttempts: Number(e.target.value) }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Account will be locked after this many consecutive failed attempts.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IP Whitelist
          </label>
          <textarea
            rows={4}
            value={form.ipWhitelist}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, ipWhitelist: e.target.value }))
            }
            placeholder="Enter one IP address or CIDR range per line&#10;e.g. 192.168.1.0/24&#10;     10.0.0.1"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to allow access from all IP addresses.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Authentication Controls"
          description="Additional security measures for user authentication."
        />
        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <ToggleSwitch
            id="mfa-required"
            checked={form.mfaRequired}
            onChange={() => toggle('mfaRequired')}
            label="Require MFA for All Users"
            description="Force all users to set up multi-factor authentication on their next login."
          />
          <ToggleSwitch
            id="captcha-reg"
            checked={form.captchaOnRegister}
            onChange={() => toggle('captchaOnRegister')}
            label="CAPTCHA on Registration"
            description="Show a CAPTCHA challenge on the registration form to prevent spam accounts."
          />
        </div>
      </div>

      <SaveBar />
    </div>
  );
}

// ----------------------------------------------------------------
// Appearance Tab
// ----------------------------------------------------------------
interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  bgColor: string;
  description: string;
}

const THEMES: ThemeOption[] = [
  { id: 'default-blue', name: 'Default Blue', primaryColor: '#2563eb', bgColor: '#eff6ff', description: 'Clean professional blue theme' },
  { id: 'modern-dark', name: 'Modern Dark', primaryColor: '#6366f1', bgColor: '#1e1b4b', description: 'Dark mode with indigo accents' },
  { id: 'ecv-brand', name: 'ECV Brand', primaryColor: '#0ea5e9', bgColor: '#f0f9ff', description: 'Official ECV institutional theme' },
  { id: 'minimal', name: 'Minimal', primaryColor: '#374151', bgColor: '#f9fafb', description: 'Neutral minimalist aesthetic' },
];

interface AppearanceState {
  selectedTheme: string;
  primaryColor: string;
  customCss: string;
  showCalendar: boolean;
  showRecentCourses: boolean;
  showLearningPlans: boolean;
  showAnnouncements: boolean;
}

function AppearanceTab() {
  const [form, setForm] = useState<AppearanceState>({
    selectedTheme: 'default-blue',
    primaryColor: '#2563eb',
    customCss: '/* Custom CSS overrides */\n\n.site-header {\n  /* your styles here */\n}',
    showCalendar: true,
    showRecentCourses: true,
    showLearningPlans: true,
    showAnnouncements: false,
  });

  const toggle = (key: keyof AppearanceState) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Theme"
          description="Select the visual theme applied across the entire platform."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  selectedTheme: theme.id,
                  primaryColor: theme.primaryColor,
                }))
              }
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                form.selectedTheme === theme.id
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {form.selectedTheme === theme.id && (
                <span className="absolute top-2 right-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </span>
              )}
              <div
                className="h-10 rounded-lg mb-3"
                style={{ backgroundColor: theme.bgColor }}
              >
                <div
                  className="h-2 w-3/5 rounded-full mx-auto mt-4"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              </div>
              <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Branding"
          description="Upload your institution logo and set the primary brand color."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
              <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                Drop logo here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, SVG or JPG — max 2 MB</p>
              <input type="file" accept=".png,.svg,.jpg,.jpeg" className="sr-only" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer p-1"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#2563eb"
              />
            </div>
            <div
              className="mt-3 h-8 w-full rounded-lg"
              style={{ backgroundColor: form.primaryColor }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Custom CSS"
          description="Advanced: inject custom CSS overrides into the platform stylesheet."
        />
        <textarea
          rows={10}
          value={form.customCss}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, customCss: e.target.value }))
          }
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y bg-gray-900 text-green-400"
          spellCheck={false}
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Dashboard Widgets"
          description="Control which widgets are shown on the student dashboard by default."
        />
        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <ToggleSwitch
            id="widget-calendar"
            checked={form.showCalendar}
            onChange={() => toggle('showCalendar')}
            label="Calendar"
            description="Show upcoming events and deadlines calendar."
          />
          <ToggleSwitch
            id="widget-courses"
            checked={form.showRecentCourses}
            onChange={() => toggle('showRecentCourses')}
            label="Recent Courses"
            description="Show recently accessed course shortcuts."
          />
          <ToggleSwitch
            id="widget-plans"
            checked={form.showLearningPlans}
            onChange={() => toggle('showLearningPlans')}
            label="Learning Plans"
            description="Show active learning plan progress overview."
          />
          <ToggleSwitch
            id="widget-announcements"
            checked={form.showAnnouncements}
            onChange={() => toggle('showAnnouncements')}
            label="Announcements"
            description="Show latest system-wide announcements."
          />
        </div>
      </div>

      <SaveBar />
    </div>
  );
}

// ----------------------------------------------------------------
// Plugins Tab
// ----------------------------------------------------------------
function PluginStatusBadge({ status }: { status: Plugin['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Active
      </span>
    );
  }
  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <ToggleLeft className="h-3 w-3" />
        Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <XCircle className="h-3 w-3" />
      Not Installed
    </span>
  );
}

function PluginsTab() {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const installedPlugins = plugins.filter((p) => p.status !== 'not-installed');
  const availablePlugins = plugins.filter((p) => p.status === 'not-installed');

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Installed Plugins"
          description="Manage plugins currently installed on your LMS instance."
        />
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {installedPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-start gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{plugin.name}</span>
                  <PluginStatusBadge status={plugin.status} />
                  <span className="text-xs text-gray-400 font-mono">v{plugin.version}</span>
                </div>
                <p className="text-sm text-gray-500">{plugin.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 mt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={plugin.status === 'active'}
                  onClick={() => togglePlugin(plugin.id)}
                  className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    plugin.status === 'active' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      plugin.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Available Plugins"
          description="Browse and install additional plugins to extend your LMS."
        />
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {availablePlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-start gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{plugin.name}</span>
                  <PluginStatusBadge status={plugin.status} />
                  <span className="text-xs text-gray-400 font-mono">v{plugin.version}</span>
                </div>
                <p className="text-sm text-gray-500">{plugin.description}</p>
              </div>
              <div className="shrink-0 mt-1">
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Install
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Email & Notifications Tab
// ----------------------------------------------------------------
interface EmailState {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmail: boolean;
  enableInApp: boolean;
  enableSms: boolean;
  notifyEnrollment: boolean;
  notifyAssignmentDue: boolean;
  notifyGradePosted: boolean;
  notifyAnnouncement: boolean;
}

function EmailTab() {
  const [form, setForm] = useState<EmailState>({
    smtpHost: 'smtp.ecv.ac.th',
    smtpPort: '587',
    smtpUser: 'lms@ecv.ac.th',
    smtpPassword: '',
    fromEmail: 'no-reply@ecv.ac.th',
    fromName: 'ECV LMS',
    enableEmail: true,
    enableInApp: true,
    enableSms: false,
    notifyEnrollment: true,
    notifyAssignmentDue: true,
    notifyGradePosted: true,
    notifyAnnouncement: false,
  });

  const toggle = (key: keyof EmailState) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="SMTP Configuration"
          description="Configure the mail server used to send outgoing emails."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="SMTP Host"
            value={form.smtpHost}
            onChange={(e) => setForm((prev) => ({ ...prev, smtpHost: e.target.value }))}
            placeholder="smtp.example.com"
          />
          <Input
            label="SMTP Port"
            value={form.smtpPort}
            onChange={(e) => setForm((prev) => ({ ...prev, smtpPort: e.target.value }))}
            placeholder="587"
          />
          <Input
            label="SMTP Username"
            value={form.smtpUser}
            onChange={(e) => setForm((prev) => ({ ...prev, smtpUser: e.target.value }))}
          />
          <Input
            label="SMTP Password"
            type="password"
            value={form.smtpPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, smtpPassword: e.target.value }))}
            placeholder="••••••••"
          />
          <Input
            label="From Email Address"
            type="email"
            value={form.fromEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, fromEmail: e.target.value }))}
          />
          <Input
            label="From Display Name"
            value={form.fromName}
            onChange={(e) => setForm((prev) => ({ ...prev, fromName: e.target.value }))}
          />
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1.5" />
            Send Test Email
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Email Template Preview"
          description="Preview how notification emails will appear to recipients."
        />
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">From:</span>
              <span>{form.fromName} &lt;{form.fromEmail}&gt;</span>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div
              className="h-3 w-24 rounded mb-4"
              style={{ backgroundColor: '#2563eb' }}
            />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
            <div className="mt-4 h-8 w-28 bg-blue-600 rounded-lg" />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Notification Channels"
          description="Choose how notifications are delivered to users."
        />
        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <ToggleSwitch
            id="chan-email"
            checked={form.enableEmail}
            onChange={() => toggle('enableEmail')}
            label="Email"
            description="Send notifications via SMTP email to user inbox."
          />
          <ToggleSwitch
            id="chan-inapp"
            checked={form.enableInApp}
            onChange={() => toggle('enableInApp')}
            label="In-App Notifications"
            description="Show notification bell icon and messages inside the platform."
          />
          <ToggleSwitch
            id="chan-sms"
            checked={form.enableSms}
            onChange={() => toggle('enableSms')}
            label="SMS (via AWS SNS)"
            description="Send SMS text notifications. Requires AWS SNS configuration."
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Default Notification Events"
          description="Select which events trigger notifications by default for all users."
        />
        <div className="space-y-3">
          {[
            { key: 'notifyEnrollment' as const, label: 'Course Enrollment', description: 'When a user is enrolled in a course.' },
            { key: 'notifyAssignmentDue' as const, label: 'Assignment Due', description: 'Reminder before an assignment deadline.' },
            { key: 'notifyGradePosted' as const, label: 'Grade Posted', description: 'When a teacher posts a grade or feedback.' },
            { key: 'notifyAnnouncement' as const, label: 'System Announcement', description: 'Platform-wide announcements from admins.' },
          ].map(({ key, label, description }) => (
            <label
              key={key}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={() => toggle(key)}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <SaveBar />
    </div>
  );
}

// ----------------------------------------------------------------
// Backup & Maintenance Tab
// ----------------------------------------------------------------
interface BackupState {
  backupEnabled: boolean;
  backupFrequency: string;
  backupTime: string;
  s3BucketPath: string;
  retentionPeriod: string;
  maintenanceMode: boolean;
}

interface HealthIndicator {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HEALTH_INDICATORS: HealthIndicator[] = [
  { name: 'Database', status: 'healthy', detail: 'Aurora MySQL — 15ms avg query', icon: Database },
  { name: 'Cache', status: 'healthy', detail: 'ElastiCache Redis — connected', icon: Cpu },
  { name: 'Storage', status: 'warning', detail: 'S3 Bucket — 78% used (390 GB / 500 GB)', icon: HardDrive },
  { name: 'Queue', status: 'healthy', detail: 'SQS — 0 messages in flight', icon: Wifi },
];

function HealthStatusDot({ status }: { status: HealthIndicator['status'] }) {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`} />
  );
}

function BackupTab() {
  const [form, setForm] = useState<BackupState>({
    backupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    s3BucketPath: 's3://ecv-lms-backups/moodle/',
    retentionPeriod: '30',
    maintenanceMode: false,
  });

  const toggle = (key: keyof BackupState) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Scheduled Backups"
          description="Configure automatic backup schedules and storage destinations."
        />

        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
          <ToggleSwitch
            id="backup-enabled"
            checked={form.backupEnabled}
            onChange={() => toggle('backupEnabled')}
            label="Enable Scheduled Backups"
            description="Automatically back up course data, user records, and configurations."
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-opacity ${!form.backupEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={form.backupFrequency}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, backupFrequency: e.target.value }))
              }
              className={SELECT_CLS}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backup Time
            </label>
            <input
              type="time"
              value={form.backupTime}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, backupTime: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retention Period
            </label>
            <select
              value={form.retentionPeriod}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, retentionPeriod: e.target.value }))
              }
              className={SELECT_CLS}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>

        <div className={`mt-4 transition-opacity ${!form.backupEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <Input
            label="S3 Backup Destination"
            value={form.s3BucketPath}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, s3BucketPath: e.target.value }))
            }
            placeholder="s3://your-bucket/path/"
            helperText="IAM role must have s3:PutObject permission on this bucket."
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Backup History"
          description="Recent backup executions and their status."
        />
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {[
              { date: '2026-02-24 02:00', size: '4.2 GB', status: 'success', duration: '8m 33s' },
              { date: '2026-02-23 02:00', size: '4.1 GB', status: 'success', duration: '8m 12s' },
              { date: '2026-02-22 02:00', size: '4.1 GB', status: 'success', duration: '8m 05s' },
              { date: '2026-02-21 02:00', size: '4.0 GB', status: 'failed', duration: '—' },
            ].map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {entry.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.date}</p>
                    <p className="text-xs text-gray-500">{entry.size} — {entry.duration}</p>
                  </div>
                </div>
                {entry.status === 'success' && (
                  <Button variant="ghost" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Run Backup Now
          </Button>
          <Button variant="outline" size="sm">
            View Full History
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="System Health"
          description="Real-time status of core platform infrastructure components."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HEALTH_INDICATORS.map((indicator) => {
            const Icon = indicator.icon;
            return (
              <div
                key={indicator.name}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  indicator.status === 'healthy'
                    ? 'border-green-200 bg-green-50'
                    : indicator.status === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <Icon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${
                    indicator.status === 'healthy'
                      ? 'text-green-600'
                      : indicator.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {indicator.name}
                    </span>
                    <HealthStatusDot status={indicator.status} />
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{indicator.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <SectionHeading
          title="Maintenance Mode"
          description="When enabled, the platform will be inaccessible to all non-admin users."
        />
        <div
          className={`rounded-xl border p-4 transition-colors ${
            form.maintenanceMode
              ? 'border-orange-300 bg-orange-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-5 w-5 mt-0.5 shrink-0 ${
                form.maintenanceMode ? 'text-orange-500' : 'text-gray-400'
              }`}
            />
            <div className="flex-1">
              <ToggleSwitch
                id="maintenance-mode"
                checked={form.maintenanceMode}
                onChange={() => toggle('maintenanceMode')}
                label="Enable Maintenance Mode"
                description={
                  form.maintenanceMode
                    ? 'Platform is currently in maintenance mode. Only administrators can log in.'
                    : 'Enabling this will display a maintenance message to all non-admin users.'
                }
              />
            </div>
          </div>
        </div>
      </div>

      <SaveBar />
    </div>
  );
}

// ----------------------------------------------------------------
// Sticky Save Bar
// ----------------------------------------------------------------
function SaveBar() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between z-10">
      <p className="text-sm text-gray-500">
        {saved ? (
          <span className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="h-4 w-4" />
            Settings saved successfully
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-gray-400">
            <AlertCircle className="h-4 w-4" />
            Unsaved changes will be lost on navigation
          </span>
        )}
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-1.5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main SiteSettings component
// ----------------------------------------------------------------
export function SiteSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const tabContent: Record<TabId, React.ReactNode> = {
    general: <GeneralTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
    plugins: <PluginsTab />,
    email: <EmailTab />,
    backup: <BackupTab />,
  };

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Administration</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage global configuration, security, appearance, and system health.
          </p>
        </div>
      </div>

      {/* Mobile tab chips */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Desktop: sidebar + content */}
      <div className="flex gap-6 items-start">
        {/* Vertical sidebar tabs — desktop only */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Card padding="sm" className="sticky top-6">
            <nav aria-label="Settings navigation">
              <ul className="space-y-0.5">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Card>
        </aside>

        {/* Tab content panel */}
        <div className="flex-1 min-w-0">
          <Card className="p-6">
            {/* Content area header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <activeTabData.icon className="h-4.5 w-4.5 text-blue-600 h-[18px] w-[18px]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTabData.label} Settings
                </h2>
                <p className="text-sm text-gray-400">
                  {activeTab === 'general' && 'Core platform identity and regional preferences.'}
                  {activeTab === 'security' && 'Authentication policies and access controls.'}
                  {activeTab === 'appearance' && 'Theme, branding, and visual customization.'}
                  {activeTab === 'plugins' && 'Extend platform functionality with third-party modules.'}
                  {activeTab === 'email' && 'Email delivery and notification preferences.'}
                  {activeTab === 'backup' && 'Data protection, recovery, and system health.'}
                </p>
              </div>
            </div>

            {/* Active tab content */}
            {tabContent[activeTab]}
          </Card>
        </div>
      </div>
    </div>
  );
}
