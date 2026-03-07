import React from 'react';
import { useToastManager, registerToast } from '../../hooks/useToast';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

const ToastManager: React.FC = () => {
  const { toasts, addToast } = useToastManager();
  registerToast(addToast);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
