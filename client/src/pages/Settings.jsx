import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Palette, Bell, Volume2, Download, Upload, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Toggle from '../components/ui/Toggle.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import useUiStore from '../store/uiStore.js';
import { setLanguage } from '../i18n/index.js';
import { authService } from '../services/authService.js';
import { reminderService } from '../services/reminderService.js';
import { LANGUAGES, VOICE_LANGUAGES, SOUND_OPTIONS, TIMEZONES } from '../utils/constants.js';
import { playSound } from '../voice/soundEngine.js';
import { voice } from '../voice/VoiceProvider.js';
import { useNotifications } from '../hooks/useNotifications.js';

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="var(--accent)" />
        </div>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, updateUser } = useAuth();
  const { theme, setTheme } = useUiStore();
  const { request: requestNotifications, permission } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [exporting, setExporting] = useState(false);

  const prefs = user?.preferences || {};

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ name });
    } catch (err) {
      toast.error(err.response?.data?.error || t('errors.generic'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreference = async (key, value) => {
    try {
      const updated = await authService.updateProfile({ preferences: { [key]: value } });
      updateUser(updated.user);
      if (key === 'language') setLanguage(value);
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await authService.changePassword(pwForm);
      toast.success(t('toast.passwordChanged'));
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || t('errors.generic'));
    } finally {
      setSavingPw(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await reminderService.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chronos-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('toast.exported'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const reminders = data.reminders || data;
      if (!Array.isArray(reminders)) throw new Error('Invalid format');
      const result = await reminderService.importAll(reminders);
      toast.success(t('toast.imported', { count: result.imported }));
    } catch {
      toast.error('Invalid import file');
    }
    e.target.value = '';
  };

  const themeOptions = [
    { value: 'dark', label: t('settings.dark') },
    { value: 'light', label: t('settings.light') },
    { value: 'system', label: t('settings.system') },
  ];

  const soundOptions = SOUND_OPTIONS.map((s) => ({ value: s, label: t(`sound.${s}`) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Header title={t('settings.title')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', maxWidth: 720 }}>

        {/* Profile */}
        <Section title={t('settings.profile')} icon={User}>
          <Input label={t('settings.changeName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={handleSaveProfile} loading={savingProfile} style={{ alignSelf: 'flex-start' }}>
            {t('actions.save')}
          </Button>
        </Section>

        {/* Appearance */}
        <Section title={t('settings.appearance')} icon={Palette}>
          <Select
            label={t('settings.theme')}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            options={themeOptions}
          />
          <Select
            label={t('settings.interfaceLanguage')}
            value={prefs.language || 'ru'}
            onChange={(e) => handlePreference('language', e.target.value)}
            options={LANGUAGES}
          />
        </Section>

        {/* Notifications */}
        <Section title={t('settings.notifications')} icon={Bell}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                {t('settings.notificationsEnabled')}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                {permission === 'granted' ? '✓ Granted' : permission === 'denied' ? '✗ Denied in browser' : 'Not requested yet'}
              </p>
            </div>
            {permission !== 'granted' && (
              <Button size="sm" onClick={requestNotifications}>
                Enable
              </Button>
            )}
          </div>
          <Toggle
            label={t('settings.notificationsEnabled')}
            checked={prefs.notificationsEnabled !== false}
            onChange={(v) => handlePreference('notificationsEnabled', v)}
          />
        </Section>

        {/* Voice */}
        <Section title={t('settings.voice')} icon={Volume2}>
          <Select
            label={t('settings.voiceLanguage')}
            value={prefs.voiceLanguage || 'auto'}
            onChange={(e) => handlePreference('voiceLanguage', e.target.value)}
            options={VOICE_LANGUAGES.map((l) => ({ ...l, label: l.value === 'auto' ? t('settings.autoLanguage') : l.label }))}
          />
          <div>
            <Select
              label={t('settings.defaultSound')}
              value={prefs.defaultSound || 'chime'}
              onChange={(e) => {
                handlePreference('defaultSound', e.target.value);
                playSound(e.target.value);
              }}
              options={soundOptions}
            />
          </div>
          <div>
            {!voice.isSupported() && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)', padding: '10px 14px', background: 'var(--warning-subtle)', borderRadius: 'var(--radius-md)' }}>
                {t('voice.notSupported')}
              </p>
            )}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
              {t('voice.autoplayBlocked')}
            </p>
          </div>
        </Section>

        {/* Password */}
        <Section title={t('settings.changePassword')} icon={Key}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label={t('settings.currentPassword')}
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
            <Input
              label={t('settings.newPassword')}
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              hint="At least 6 characters"
              required
            />
            <Button type="submit" loading={savingPw} style={{ alignSelf: 'flex-start' }}>
              {t('settings.changePassword')}
            </Button>
          </form>
        </Section>

        {/* Export / Import */}
        <Section title="Data" icon={Download}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport} loading={exporting}>
              {t('settings.exportData')}
            </Button>
            <label>
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              <Button variant="secondary" icon={<Upload size={15} />} as="span" style={{ cursor: 'pointer' }}>
                {t('settings.importData')}
              </Button>
            </label>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Export your reminders as JSON. Import supports Chronos-format JSON files.
          </p>
        </Section>
      </div>
    </div>
  );
}
