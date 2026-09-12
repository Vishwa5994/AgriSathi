import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const StepperProgress = ({ status, paymentStatus }) => {
  const { t } = useLanguage();

  let currentStep = 0;
  if (paymentStatus === 'CLAIMED' || status === 'PENDING_CONFIRMATION') {
    currentStep = 1;
  }
  if (paymentStatus === 'PAID' || status === 'CONFIRMED') {
    currentStep = 2;
  }
  if (status === 'COMPLETED') {
    currentStep = 3;
  }
  if (status === 'CANCELLED' || paymentStatus === 'REJECTED') {
    currentStep = -1; // Cancelled state
  }

  const steps = [
    { title: t('1. Order Placed'), desc: t('Listing reserved') },
    { title: t('2. Buyer Pays'), desc: t('UPI transfer sent') },
    { title: t('3. Farmer Verifies'), desc: t('Confirm in app') },
    { title: t('4. Order Ready'), desc: t('Direct pickup') },
  ];

  if (currentStep === -1) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-sm font-semibold">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <p className="font-bold">{t('Transaction Cancelled / Payment Rejected')}</p>
          <p className="text-xs font-normal text-rose-600">
            {t('The farmer reported payment not received or the order was cancelled.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full" />
        
        {/* Animated Active Progress Bar */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  backgroundColor: isCompleted || isCurrent ? '#10b981' : '#ffffff',
                  borderColor: isCompleted || isCurrent ? '#059669' : '#cbd5e1'
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold text-xs shadow-sm ${
                  isCompleted || isCurrent ? 'text-white' : 'text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                ) : (
                  idx + 1
                )}
              </motion.div>

              <div className="mt-2 text-center max-w-[60px] sm:max-w-[90px]">
                <p
                  className={`text-[10px] sm:text-xs font-bold leading-tight ${
                    isCurrent ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
