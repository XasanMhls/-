import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore.js';
import { authService } from '../services/authService.js';
import { setLanguage } from '../i18n/index.js';
import { voice } from '../voice/VoiceProvider.js';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const greet = useCallback(async (userName, lang = 'ru') => {
    const firstName = userName?.split(' ')[0] || '';
    const messages = {
      ru: `Добро пожаловать, ${firstName}. Рад вас видеть!`,
      en: `Welcome back, ${firstName}. Good to see you!`,
      uz: `Xush kelibsiz, ${firstName}. Sizi ko'rganimdan xursandman!`,
    };
    const text = messages[lang] || messages.ru;
    try {
      await voice.speak(text, lang, { rate: 0.88, pitch: 1.05 });
    } catch {
      // silently ignore if TTS fails
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    setAuth(user, token);
    // Priority: server preference → localStorage (set on landing/login) → fallback 'ru'
    const storedLang = localStorage.getItem('chronos_lang');
    const lang = user.preferences?.language || storedLang || 'ru';
    setLanguage(lang);
    await greet(user.name, lang);
    navigate('/dashboard');
  }, [setAuth, navigate, greet]);

  const register = useCallback(async (data) => {
    const { user, token } = await authService.register(data);
    setAuth(user, token);
    const storedLang = localStorage.getItem('chronos_lang');
    const lang = user.preferences?.language || storedLang || 'ru';
    setLanguage(lang);
    await greet(user.name, lang);
    navigate('/dashboard');
  }, [setAuth, navigate, greet]);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const updateProfile = useCallback(async (data) => {
    const { user: updated } = await authService.updateProfile(data);
    updateUser(updated);
    toast.success(t('toast.settingsSaved'));
    return updated;
  }, [updateUser, t]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
  };
}
