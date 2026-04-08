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

const SECTION_COLORS = {
  User:    { from: '#B9FF66', to: '#d4ff99' },
  Palette: { from: '#4a9eff', to: '#B9FF66' },
  Bell:    { from: '#f5a524', to: '#fb923c' },
  Volume2: { from: '#23d18b', to: '#4a9eff' },
  Key:     { from: '#f04e65', to: '#f472b6' },
  Download:{ from: '#23d18b', to: '#B9FF66' },
};

function Section({ title, icon: Icon, children }) {
  const colors = SECTION_COLORS[Icon.displayName || Icon.name] || { from: 'var(--accent)', to: '#d4ff99' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 16,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 22px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(to right, rgba(108,99,255,0.03), transparent)',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${colors.from}40`,
          flexShrink: 0,
        }}>
          <Icon size={16} color="white" />
        </div>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
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
      const prefs = { [key]: value };
      // When changing interface language, also sync voice language if it's 'auto'
      if (key === 'language') {
        const currentVoiceLang = user?.preferences?.voiceLanguage || 'auto';
        if (currentVoiceLang === 'auto') {
          // Voice will auto-follow via localStorage — just update localStorage
        }
        prefs.voiceLanguage = 'auto'; // Reset to auto so voice follows interface language
      }
      const updated = await authService.updateProfile({ preferences: prefs });
      updateUser(updated.user);
      if (key === 'language') setLanguage(value);
    } catch (err) {
      console.error('handlePreference error:', err);
      toast.error(err.response?.data?.error || err.message || t('errors.generic'));
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

      <div className="settings-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'visible', padding: '24px 28px', maxWidth: 720, paddingBottom: 80 }}>

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
                {permission === 'granted' ? t('settings.notifGranted') : permission === 'denied' ? t('settings.notifDenied') : t('settings.notifPending')}
              </p>
            </div>
            {permission !== 'granted' && (
              <Button size="sm" onClick={requestNotifications}>
                {t('settings.enable')}
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
            <Button
              variant="secondary"
              icon={<Volume2 size={15} />}
              onClick={() => {
                const voiceLang = prefs.voiceLanguage || 'auto';
                const lang = voiceLang === 'auto'
                  ? (localStorage.getItem('chronos_lang') || i18n.language || 'ru').split('-')[0]
                  : voiceLang;
                const testTexts = {
                  ru: 'Голосовое напоминание активировано. Chronos готов.',
                  en: 'Voice reminder activated. Chronos is ready.',
                  uz: 'Ovozli eslatma faollashtirildi. Chronos tayyor.',
                };
                voice.speak(testTexts[lang] || testTexts.en, lang);
              }}
            >
              {t('reminder.testVoice')}
            </Button>
            {!voice.isSupported() && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)', padding: '10px 14px', background: 'var(--warning-subtle)', borderRadius: 'var(--radius-md)', marginTop: 10 }}>
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
              hint={t('settings.passwordHint')}
              required
            />
            <Button type="submit" loading={savingPw} style={{ alignSelf: 'flex-start' }}>
              {t('settings.changePassword')}
            </Button>
          </form>
        </Section>

        {/* Export / Import */}
        <Section title={t('settings.data')} icon={Download}>
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
            {t('settings.dataHint')}
          </p>
        </Section>
      </div>
    </div>
  );
}
