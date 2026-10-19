import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-cyan-50 text-cyan-500'}`}>
                    <i className={`bi ${type === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-circle'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className={`flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg transition-all ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200'}`}>
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;