import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    return (
        <div className={`fixed bottom-6 right-6 z-50`}>
            <div
                className={`
          px-4 py-2 rounded-lg shadow-lg transition-all duration-300
          text-white
          ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
        `}
            >
                <div className="flex items-center justify-between gap-4">
                    <span>{message}</span>
                    <button onClick={onClose} className="text-sm font-bold">✕</button>
                </div>
            </div>
        </div>
    );
};
