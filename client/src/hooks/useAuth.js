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

  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    setAuth(user, token);
    if (user.preferences?.language) {
      setLanguage(user.preferences.language);
    }
    navigate('/dashboard');
  }, [setAuth, navigate]);

  const register = useCallback(async (data) => {
    const { user, token } = await authService.register(data);
    setAuth(user, token);
    navigate('/dashboard');
  }, [setAuth, navigate]);

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
