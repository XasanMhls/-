import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore.js';
import { authService } from '../services/authService.js';
import { setLanguage } from '../i18n/index.js';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const greet = useCallback((userName, lang = 'ru') => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      const firstName = userName?.split(' ')[0] || '';
      const messages = {
        ru: `Добро пожаловать, ${firstName}!`,
        en: `Welcome, ${firstName}!`,
        uz: `Xush kelibsiz, ${firstName}!`,
      };
      const msg = new SpeechSynthesisUtterance(messages[lang] || messages.ru);
      msg.lang = lang === 'uz' ? 'uz-UZ' : lang === 'en' ? 'en-US' : 'ru-RU';
      msg.volume = 1;
      msg.rate = 0.95;
      msg.onend = resolve;
      msg.onerror = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    });
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    setAuth(user, token);
    const lang = user.preferences?.language || 'ru';
    if (user.preferences?.language) setLanguage(lang);
    await greet(user.name, lang);
    navigate('/dashboard');
  }, [setAuth, navigate, greet]);

  const register = useCallback(async (data) => {
    const { user, token } = await authService.register(data);
    setAuth(user, token);
    const lang = user.preferences?.language || 'ru';
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
