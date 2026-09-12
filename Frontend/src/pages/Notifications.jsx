import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { formatDate } from '../utils/formatCurrency';
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-emerald-600" /> {t('Notifications Center')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('Real-time updates on orders, payment claims, and confirmations')}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            {t('Mark All as Read')}
          </Button>
        )}
      </div>

      <Card className="p-6 bg-white border-slate-200 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t('No notifications available.')}
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              onClick={() => {
                markAsRead(n.notification_id);
                if (n.target_order_id) navigate('/orders');
              }}
              className={`py-4 px-2 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 rounded-xl ${
                !n.is_read ? 'bg-emerald-50/50 font-bold' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                {n.type === 'PAYMENT_CLAIMED' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{t(n.title)}</h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formatDate(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t(n.message)}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
