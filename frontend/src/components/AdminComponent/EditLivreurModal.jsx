import React, { useState, useEffect } from 'react';

const EditLivreurModal = ({ isOpen, onClose, livreurData, onSave }) => {
    const [formData, setFormData] = useState({ nomComplet: '', email: '', telephone: '', adresse: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(livreurData ? { ...livreurData } : { nomComplet: '', email: '', telephone: '', adresse: '' });
        }
    }, [isOpen, livreurData]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Supprime tout sauf les chiffres
        setFormData({ ...formData, telephone: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await onSave(formData); } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{livreurData ? "Modifier Livreur" : "Nouveau Livreur"}</h3>
                <p className="text-slate-400 text-sm mb-8 font-medium">{livreurData ? `ID: TD-${livreurData._id.slice(-5)}` : "Ajout d'un nouveau collaborateur"}</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nom Complet</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" value={formData.nomComplet} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                        <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Téléphone</label>
                            <input type="text" maxLength="10" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" value={formData.telephone} onChange={handlePhoneChange}  required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adresse</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} required />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200">Annuler</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-cyan-600 flex justify-center">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditLivreurModal;