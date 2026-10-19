// src/components/AdminComponent/ColisDetailsModal.jsx
import React from 'react';

const ColisDetailsModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 text-left">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg"><i className="bi bi-box-seam"></i></div>
                    Fiche du Colis
                </h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ID Colis</p>
                            <p className="font-black text-amber-600">{data.code}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Poids</p>
                            <p className="font-black text-slate-700">{data.poids} kg</p>
                        </div>
                    </div>

                    {/* Bloc Expéditeur */}
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Expéditeur</p>
                        <p className="text-sm font-black text-slate-800">{data.expediteur?.nom}</p>
                        <p className="text-[11px] text-slate-400">{data.expediteur?.adresse}</p>
                    </div>

                    {/* Bloc Destinataire */}
                    <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl">
                        <p className="text-[10px] font-black text-cyan-600 uppercase mb-2">Destinataire</p>
                        <p className="text-sm font-black text-slate-800">{data.destinataire?.nom}</p>
                        <p className="text-[11px] text-slate-500">{data.destinataire?.adresse}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Tél: {data.destinataire?.telephone}</p>
                    </div>
                </div>

                <button onClick={onClose} className="w-full mt-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">FERMER LA FICHE</button>
            </div>
        </div>
    );
};

export default ColisDetailsModal;