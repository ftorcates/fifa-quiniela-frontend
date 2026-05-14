import { useModal } from '../context/ModalContext';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const Modal = () => {
  const { isOpen, message, type, hide } = useModal();

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-emerald-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-emerald-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-emerald-500' : 'text-red-500';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
        onClick={hide}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
        onClick={(e) => {
          if (e.target === e.currentTarget) hide();
        }}
      >
        <div
          className={`${bgColor} border ${borderColor} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200`}
          role="alertdialog"
          aria-modal="true"
        >
          <div className="flex items-start gap-4">
            {/* Icono */}
            <Icon size={24} className={`${iconColor} flex-shrink-0 mt-0.5`} />

            {/* Contenido */}
            <div className="flex-1">
              <p className={`${textColor} text-sm font-medium leading-relaxed`}>
                {message}
              </p>
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={hide}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                isSuccess
                  ? 'hover:bg-emerald-100'
                  : 'hover:bg-red-100'
              }`}
              aria-label="Cerrar"
            >
              <X size={20} className={textColor} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
