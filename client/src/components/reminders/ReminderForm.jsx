import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Play } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Toggle from '../ui/Toggle.jsx';
import Button from '../ui/Button.jsx';
import { COLOR_TAG_VALUES, TIMEZONES, REMINDER_TEMPLATES } from '../../utils/constants.js';
import { formatForInput } from '../../utils/date.js';
import { voice } from '../../voice/VoiceProvider.js';
import { playSound } from '../../voice/soundEngine.js';

const DEFAULT_FORM = {
  title: '',
  guestName: '',
  description: '',
  remindAt: '',
  language: 'auto',
  voiceEnabled: true,
  soundEnabled: true,
  sound: 'chime',
  repeat: 'none',
  priority: 'medium',
  colorTag: 'none',
  isPinned: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

export default function ReminderForm({ initial, onSubmit, onCancel, loading }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initial });
  const [errors, setErrors] = useState({});
  const [testingVoice, setTestingVoice] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        ...DEFAULT_FORM,
        ...initial,
        remindAt: initial.remindAt ? formatForInput(initial.remindAt) : '',
      });
    }
  }, [initial]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setEvent = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const applyTemplate = (template) => {
    setForm((f) => ({ ...f, ...template.defaults }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t('reminder.title') + ' required';
    if (!form.remindAt) errs.remindAt = t('reminder.remindAt') + ' required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      remindAt: new Date(form.remindAt).toISOString(),
    };
    onSubmit(data);
  };

  const testVoice = async () => {
    setTestingVoice(true);
    try {
      if (form.soundEnabled) playSound(form.sound);
      if (form.voiceEnabled) {
        const lang = form.language === 'auto' ? i18n.language : form.language;
        await voice.speak(
          form.title || t('reminder.titlePlaceholder'),
          lang
        );
      }
    } finally {
      setTestingVoice(false);
    }
  };

  const langOptions = [
    { value: 'auto', label: t('settings.autoLanguage') },
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
    { value: 'uz', label: "O'zbek" },
  ];

  const priorityOptions = ['low', 'medium', 'high', 'urgent'].map((p) => ({
    value: p,
    label: t(`priority.${p}`),
  }));

  const repeatOptions = ['none', 'daily', 'weekly', 'monthly', 'custom'].map((r) => ({
    value: r,
    label: t(`repeat.${r}`),
  }));

  const soundOptions = ['bell', 'chime', 'pulse', 'notification', 'none'].map((s) => ({
    value: s,
    label: t(`sound.${s}`),
  }));

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Templates */}
      <div>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Templates
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {REMINDER_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                transition: 'all var(--t-fast)',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-subtle)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-surface-2)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <span>{tmpl.icon}</span>
              {tmpl.label[i18n.language] || tmpl.label.en}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Title */}
      <Input
        label={t('reminder.title')}
        value={form.title}
        onChange={setEvent('title')}
        placeholder={t('reminder.titlePlaceholder')}
        error={errors.title}
      />

      {/* Guest name */}
      <Input
        label={t('reminder.guestName')}
        value={form.guestName}
        onChange={setEvent('guestName')}
        placeholder={t('reminder.guestPlaceholder')}
      />

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {t('reminder.description')}
        </label>
        <textarea
          value={form.description}
          onChange={setEvent('description')}
          placeholder={t('reminder.addDescription')}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--bg-surface-2)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            transition: 'border-color var(--t-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Date + Time */}
      <Input
        type="datetime-local"
        label={t('reminder.remindAt')}
        value={form.remindAt}
        onChange={setEvent('remindAt')}
        error={errors.remindAt}
        min={new Date().toISOString().slice(0, 16)}
      />

      {/* Priority + Repeat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select
          label={t('reminder.priority')}
          value={form.priority}
          onChange={setEvent('priority')}
          options={priorityOptions}
        />
        <Select
          label={t('reminder.repeat')}
          value={form.repeat}
          onChange={setEvent('repeat')}
          options={repeatOptions}
        />
      </div>

      {/* Color tag */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
          {t('reminder.colorTag')}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(COLOR_TAG_VALUES).map(([key, color]) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm((f) => ({ ...f, colorTag: key }))}
              title={t(`colorTag.${key}`)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: color,
                border: form.colorTag === key ? '3px solid var(--text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'transform var(--t-fast), border var(--t-fast)',
                transform: form.colorTag === key ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Sound + Voice */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <Toggle
            checked={form.voiceEnabled}
            onChange={set('voiceEnabled')}
            label={t('reminder.voiceEnabled')}
          />
          <Toggle
            checked={form.soundEnabled}
            onChange={set('soundEnabled')}
            label={t('reminder.soundEnabled')}
          />
          <Toggle
            checked={form.isPinned}
            onChange={set('isPinned')}
            label={t('reminder.isPinned')}
          />
        </div>

        {(form.voiceEnabled || form.soundEnabled) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {form.soundEnabled && (
              <Select
                label={t('reminder.sound')}
                value={form.sound}
                onChange={(e) => {
                  setEvent('sound')(e);
                  playSound(e.target.value);
                }}
                options={soundOptions}
              />
            )}
            {form.voiceEnabled && (
              <Select
                label={t('reminder.language')}
                value={form.language}
                onChange={setEvent('language')}
                options={langOptions}
              />
            )}
          </div>
        )}

        {/* Test voice button */}
        {(form.voiceEnabled || form.soundEnabled) && (
          <Button
            type="button"
            variant="accent"
            size="sm"
            icon={<Play size={14} />}
            onClick={testVoice}
            loading={testingVoice}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('reminder.testVoice')}
          </Button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('actions.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
