import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Volume2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { voice } from '../../voice/VoiceProvider.js';
import { detectLang } from '../../hooks/useLanguageDetect.js';

/* ─── Knowledge base ─────────────────────────────────────── */
const KB = {
  ru: {
    greeting: 'Привет! Я AI-помощник Chronos. Чем могу помочь?',
    helpList: [
      'Создать напоминание',
      'Как работает озвучка?',
      'Как изменить язык?',
      'Как использовать шаблоны?',
      'Как работает выделение текста?',
      'Как настроить звук?',
      'Как работает календарь?',
    ],
    answers: {
      reminder: 'Чтобы создать напоминание:\n1. Нажмите кнопку "+" в правом нижнем углу\n2. Заполните название и дату\n3. Выберите приоритет и звук\n4. Нажмите "Сохранить"\n\nМожете использовать шаблоны (Встреча, Звонок и др.) для быстрого создания.',
      voice: 'Озвучка работает так:\n• При срабатывании напоминания — Chronos озвучит его вслух\n• Выделите любой текст на странице — появится кнопка 🔊 для озвучки\n• В карточке напоминания нажмите на иконку громкости\n\nЯзык озвучки определяется автоматически или через настройки.',
      language: 'Чтобы изменить язык:\n1. Перейдите в Настройки → Внешний вид\n2. Выберите "Язык интерфейса"\n3. Доступны: Русский, English, O\'zbek\n\nЯзык озвучки автоматически следует за языком интерфейса.',
      template: 'Шаблоны ускоряют создание напоминаний:\n1. При создании напоминания вверху вы увидите шаблоны\n2. Нажмите на шаблон (Встреча, Звонок, Задача, и др.)\n3. Название и настройки заполнятся автоматически\n4. Останется только выбрать дату и время',
      selection: 'Озвучка при выделении текста:\n1. Выделите (или зажмите на мобильном) любой текст на странице\n2. Появится зелёная кнопка 🔊\n3. Нажмите на неё — текст будет озвучен\n4. Язык определяется автоматически (русский, английский или узбекский)',
      sound: 'Настройки звука:\n1. Перейдите в Настройки → Голос\n2. Выберите звук по умолчанию (Колокол, Перезвон, Пульс, Уведомление)\n3. Можно настроить звук для каждого напоминания отдельно\n4. Нажмите "Тест голоса" чтобы проверить',
      calendar: 'Календарь:\n1. Перейдите в раздел "Календарь" через боковое меню\n2. Нажмите на день чтобы увидеть напоминания\n3. Цветные точки показывают количество напоминаний\n4. На мобильном — нажмите на день, список появится ниже',
      notFound: 'Я не совсем понял вопрос. Попробуйте спросить о:\n• Создании напоминаний\n• Озвучке текста\n• Настройках языка\n• Шаблонах\n• Календаре\n• Звуках и уведомлениях',
    },
  },
  en: {
    greeting: 'Hi! I\'m the Chronos AI assistant. How can I help?',
    helpList: [
      'Create a reminder',
      'How does voice work?',
      'How to change language?',
      'How to use templates?',
      'How does text selection work?',
      'How to configure sounds?',
      'How does the calendar work?',
    ],
    answers: {
      reminder: 'To create a reminder:\n1. Tap the "+" button in the bottom-right corner\n2. Fill in the title and date\n3. Choose priority and sound\n4. Tap "Save"\n\nYou can use templates (Meeting, Call, etc.) for quick creation.',
      voice: 'Voice features:\n• When a reminder fires — Chronos reads it aloud\n• Select any text on the page — a 🔊 button appears to speak it\n• Tap the volume icon on a reminder card\n\nLanguage is detected automatically or set in Settings.',
      language: 'To change language:\n1. Go to Settings → Appearance\n2. Select "Interface language"\n3. Available: Русский, English, O\'zbek\n\nVoice language automatically follows the interface language.',
      template: 'Templates speed up reminder creation:\n1. When creating a reminder, you\'ll see templates at the top\n2. Tap a template (Meeting, Call, Task, etc.)\n3. Title and settings fill in automatically\n4. Just pick the date and time',
      selection: 'Text-to-speech on selection:\n1. Select (or long-press on mobile) any text on the page\n2. A green 🔊 button appears\n3. Tap it — the text will be read aloud\n4. Language is detected automatically (Russian, English, or Uzbek)',
      sound: 'Sound settings:\n1. Go to Settings → Voice\n2. Choose default sound (Bell, Chime, Pulse, Notification)\n3. You can set a sound per reminder individually\n4. Press "Test voice" to preview',
      calendar: 'Calendar:\n1. Go to "Calendar" via the sidebar\n2. Tap a day to see its reminders\n3. Colored dots show reminder count\n4. On mobile — tap a day, the list shows below',
      notFound: 'I didn\'t quite understand. Try asking about:\n• Creating reminders\n• Voice & text-to-speech\n• Language settings\n• Templates\n• Calendar\n• Sounds & notifications',
    },
  },
  uz: {
    greeting: 'Salom! Men Chronos AI yordamchisiman. Qanday yordam bera olaman?',
    helpList: [
      'Eslatma yaratish',
      'Ovoz qanday ishlaydi?',
      'Tilni qanday o\'zgartirish?',
      'Shablonlardan qanday foydalanish?',
      'Matn tanlash qanday ishlaydi?',
      'Tovushni qanday sozlash?',
      'Kalendar qanday ishlaydi?',
    ],
    answers: {
      reminder: 'Eslatma yaratish uchun:\n1. Pastki o\'ng burchakdagi "+" tugmasini bosing\n2. Sarlavha va sanani kiriting\n3. Ustuvorlik va tovushni tanlang\n4. "Saqlash" tugmasini bosing\n\nTez yaratish uchun shablonlardan foydalaning (Uchrashuv, Qo\'ng\'iroq va boshqalar).',
      voice: 'Ovoz funksiyalari:\n• Eslatma ishga tushganda — Chronos uni ovoz chiqarib o\'qiydi\n• Sahifadagi istalgan matnni belgilang — 🔊 tugmasi paydo bo\'ladi\n• Eslatma kartasidagi ovoz ikonkasini bosing\n\nTil avtomatik aniqlanadi yoki Sozlamalardan o\'rnatiladi.',
      language: 'Tilni o\'zgartirish uchun:\n1. Sozlamalar → Tashqi ko\'rinish ga o\'ting\n2. "Interfeys tili"ni tanlang\n3. Mavjud: Русский, English, O\'zbek\n\nOvoz tili interfeys tiliga avtomatik mos keladi.',
      template: 'Shablonlar eslatma yaratishni tezlashtiradi:\n1. Eslatma yaratayotganda yuqorida shablonlarni ko\'rasiz\n2. Shablonni bosing (Uchrashuv, Qo\'ng\'iroq, Vazifa va boshqalar)\n3. Sarlavha va sozlamalar avtomatik to\'ldiriladi\n4. Faqat sana va vaqtni tanlash qoladi',
      selection: 'Matn tanlashda ovoz:\n1. Sahifadagi istalgan matnni belgilang (mobilda bosib turing)\n2. Yashil 🔊 tugma paydo bo\'ladi\n3. Uni bosing — matn ovoz chiqarib o\'qiladi\n4. Til avtomatik aniqlanadi (rus, ingliz yoki o\'zbek)',
      sound: 'Tovush sozlamalari:\n1. Sozlamalar → Ovoz ga o\'ting\n2. Standart tovushni tanlang (Qo\'ng\'iroq, Jarang, Puls, Bildirishnoma)\n3. Har bir eslatma uchun alohida tovush o\'rnatish mumkin\n4. Tekshirish uchun "Ovozni sinash" tugmasini bosing',
      calendar: 'Kalendar:\n1. Yon menyu orqali "Kalendar"ga o\'ting\n2. Eslatmalarni ko\'rish uchun kunga bosing\n3. Rangli nuqtalar eslatmalar sonini ko\'rsatadi\n4. Mobilda — kunga bosing, ro\'yxat pastda paydo bo\'ladi',
      notFound: 'Tushunmadim. Quyidagilar haqida so\'rang:\n• Eslatma yaratish\n• Ovoz va matn o\'qish\n• Til sozlamalari\n• Shablonlar\n• Kalendar\n• Tovushlar va bildirishnomalar',
    },
  },
};

/* ─── Intent detection ────────────────────────────────────── */
const INTENTS = [
  {
    key: 'reminder',
    patterns: [
      /созда|напомин|добав|новое|reminder|create|add|new|eslatma|yarat|qo'sh/i,
    ],
  },
  {
    key: 'voice',
    patterns: [
      /озвучк|голос|tts|speak|voice|read.*aloud|ovoz|gapir/i,
    ],
  },
  {
    key: 'language',
    patterns: [
      /язык|lang|тил|til|o'zgartir|сменить|change.*lang|interfeys/i,
    ],
  },
  {
    key: 'template',
    patterns: [
      /шаблон|template|shablon|встреч|звон|meeting|call|uchrashuv/i,
    ],
  },
  {
    key: 'selection',
    patterns: [
      /выдел|select|belgi|выделение|tanlash|text.*speech|озвуч.*текст/i,
    ],
  },
  {
    key: 'sound',
    patterns: [
      /звук|sound|tovush|настро.*звук|уведомлен|notif|bildirishnoma/i,
    ],
  },
  {
    key: 'calendar',
    patterns: [
      /календар|calendar|kalendar|taqvim/i,
    ],
  },
];

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(lower)) return intent.key;
    }
  }
  return null;
}

/* ─── Component ───────────────────────────────────────────── */
export default function AiAssistant() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const lang = (i18n.language || 'en').split('-')[0];
  const kb = KB[lang] || KB.en;

  // Initialize with greeting
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'ai', text: kb.greeting },
        { role: 'ai', text: formatHelpList(kb.helpList, lang), isHelp: true },
      ]);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const addAiMessage = useCallback((text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'ai', text }]);
    }, 400 + Math.random() * 400);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    const intent = detectIntent(text);
    const currentKb = KB[(i18n.language || 'en').split('-')[0]] || KB.en;

    if (intent) {
      addAiMessage(currentKb.answers[intent]);
    } else {
      addAiMessage(currentKb.answers.notFound);
    }
  }, [input, addAiMessage, i18n.language]);

  const handleQuickAction = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
    const intent = detectIntent(text);
    const currentKb = KB[(i18n.language || 'en').split('-')[0]] || KB.en;
    if (intent) {
      addAiMessage(currentKb.answers[intent]);
    } else {
      addAiMessage(currentKb.answers.notFound);
    }
  }, [addAiMessage, i18n.language]);

  const handleSpeak = useCallback((text) => {
    const clean = text.replace(/[•\n]/g, ' ').replace(/\d+\./g, '').trim();
    const { lang: detectedLang } = detectLang(clean);
    voice.speak(clean, detectedLang);
  }, []);

  const clearChat = useCallback(() => {
    const currentKb = KB[(i18n.language || 'en').split('-')[0]] || KB.en;
    setMessages([
      { role: 'ai', text: currentKb.greeting },
      { role: 'ai', text: formatHelpList(currentKb.helpList, (i18n.language || 'en').split('-')[0]), isHelp: true },
    ]);
  }, [i18n.language]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed',
              bottom: 90,
              right: 28,
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4a9eff, #6366f1)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 49,
              boxShadow: '0 4px 20px rgba(74,158,255,0.45)',
            }}
          >
            <Sparkles size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(520px, calc(100dvh - 40px))',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              boxShadow: '0 16px 60px rgba(0,0,0,0.35)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(74,158,255,0.08), rgba(99,102,241,0.04))',
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #4a9eff, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Chronos AI
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {lang === 'ru' ? 'Ваш помощник' : lang === 'uz' ? 'Yordamchingiz' : 'Your assistant'}
                </div>
              </div>
              <button
                onClick={clearChat}
                title="Clear"
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 4,
                }}>
                  <div style={{
                    maxWidth: '88%',
                    padding: msg.isHelp ? '8px 12px' : '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #4a9eff, #6366f1)'
                      : 'var(--bg-surface-2)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  }}>
                    {msg.isHelp ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {kb.helpList.map((item, j) => (
                          <button
                            key={j}
                            onClick={() => handleQuickAction(item)}
                            style={{
                              textAlign: 'left',
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                              cursor: 'pointer',
                              transition: 'all 120ms',
                              fontFamily: 'var(--font-body)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--accent-subtle)';
                              e.currentTarget.style.borderColor = 'var(--accent)';
                              e.currentTarget.style.color = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-surface)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.role === 'ai' && !msg.isHelp && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 12,
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', fontSize: 10,
                        cursor: 'pointer', transition: 'color 120ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Volume2 size={11} />
                      {lang === 'ru' ? 'Озвучить' : lang === 'uz' ? 'O\'qish' : 'Read aloud'}
                    </button>
                  )}
                </div>
              ))}

              {typing && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border)',
                  alignSelf: 'flex-start',
                  maxWidth: '88%',
                }}>
                  <span style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--text-muted)',
                          display: 'block',
                        }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  lang === 'ru' ? 'Задайте вопрос...' :
                  lang === 'uz' ? 'Savol bering...' :
                  'Ask a question...'
                }
                style={{
                  flex: 1,
                  height: 38,
                  padding: '0 12px',
                  background: 'var(--bg-surface-2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 20,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'border-color 120ms',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: input.trim() ? 'linear-gradient(135deg, #4a9eff, #6366f1)' : 'var(--bg-surface-3)',
                  color: input.trim() ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'default',
                  flexShrink: 0,
                  transition: 'background 120ms',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function formatHelpList(items, lang) {
  const header = lang === 'ru' ? 'Выберите тему:' : lang === 'uz' ? 'Mavzuni tanlang:' : 'Choose a topic:';
  return header;
}
