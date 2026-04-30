'use client';
import { X, CheckCircle, AlertCircle, Bell, Zap } from 'lucide-react';
import clsx from 'clsx';
import useStore from '@/store/useStore';

const CONFIG = {
  success: { Icon: CheckCircle, color: 'text-green',  leftBorder: 'border-l-green',  bg: 'bg-surface' },
  warning: { Icon: Zap,         color: 'text-warn',   leftBorder: 'border-l-warn',   bg: 'bg-surface' },
  info:    { Icon: Bell,        color: 'text-info',   leftBorder: 'border-l-info',   bg: 'bg-surface' },
  error:   { Icon: AlertCircle, color: 'text-danger', leftBorder: 'border-l-danger', bg: 'bg-surface' },
};

export default function ToastContainer() {
  const notifications = useStore(s => s.notifications);
  const dismissToast  = useStore(s => s.dismissToast);

  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80 pointer-events-none">
      {notifications.map(n => {
        const cfg  = CONFIG[n.type] ?? CONFIG.info;
        const Icon = cfg.Icon;
        return (
          <div
            key={n.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl',
              'border border-rim border-l-4',
              cfg.bg, cfg.leftBorder
            )}
          >
            <Icon size={16} className={clsx('shrink-0 mt-0.5', cfg.color)} />
            <div className="flex-1 min-w-0">
              {n.title && (
                <div className={clsx('text-xs font-bold mb-0.5', cfg.color)}>
                  {n.title}
                </div>
              )}
              <p className="text-sm text-white leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              className="shrink-0 text-muted hover:text-white transition-colors mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
