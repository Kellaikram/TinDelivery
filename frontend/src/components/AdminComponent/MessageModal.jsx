import React from 'react';

const MessageModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center transform animate-in zoom-in-95">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${type === 'error' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    <i className={`bi ${type === 'error' ? 'bi-x-circle' : 'bi-exclamation-triangle'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{title}</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">{message}</p>
                <button onClick={onClose} className="w-full py-4 bg-[#013c58] text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all">
                    COMPRIS
                </button>
            </div>
        </div>
    );
};
export default MessageModal;