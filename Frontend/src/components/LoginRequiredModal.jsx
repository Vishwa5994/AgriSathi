import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Lock, LogIn, UserPlus, Sprout, ShieldAlert } from 'lucide-react';

export const LoginRequiredModal = ({ isOpen, onClose, actionTitle }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onClose();
    navigate('/login');
  };

  const handleSignupClick = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('login_required_title')}
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center pt-2">
        {/* Animated Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-bounce-subtle">
          <Lock className="w-8 h-8 text-amber-300" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {t('login_required_heading')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
            {actionTitle
              ? `${t('login_required_action_prefix')} "${actionTitle}" ${t('login_required_action_suffix')}`
              : t('login_required_desc')}
          </p>
        </div>

        {/* Guest info box */}
        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 text-left">
          <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('guest_access_note')}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleLoginClick}
            icon={LogIn}
            className="shadow-md"
          >
            {t('login_now')}
          </Button>

          <Button
            variant="outline"
            fullWidth
            size="md"
            onClick={handleSignupClick}
            icon={UserPlus}
          >
            {t('create_account')}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 pt-2 cursor-pointer transition-colors"
          >
            {t('continue_browsing')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
