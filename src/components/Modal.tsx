import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'auth';
}

export default function Modal({ isOpen, onClose, title, children, variant = 'default' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isAuth = variant === 'auth';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOutsideClick}
      className={`fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] ${
        isAuth
          ? 'items-stretch justify-center p-0 sm:p-4 sm:items-center'
          : 'items-center justify-center p-3 sm:p-4'
      }`}
      id="linkfluence-modal-portal"
    >
      <div
        ref={modalRef}
        className={`relative w-full bg-[#FAFAF7] border border-gray-100 overflow-hidden shadow-2xl flex flex-col font-sans ${
          isAuth
            ? 'h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[min(720px,92dvh)] sm:max-w-[480px] sm:rounded-2xl rounded-none'
            : 'max-w-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh]'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 bg-white gap-3 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors duration-150 flex-shrink-0"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`flex-1 min-h-0 flex flex-col ${
            isAuth ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6 md:p-8 max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-120px)]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
