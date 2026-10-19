import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const EditLivraisonModal = ({ isOpen, onClose, deliveryData, onUpdate }) => {
    const [formData, setFormData] = useState({
        adresse: '',
        idLivreur: '',
        statut: ''
    });
    const [livreurs, setLivreurs] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Charger les données de la livraison et la liste des livreurs
    useEffect(() => {
        if (isOpen && deliveryData) {
            // Initialiser le formulaire avec les données actuelles
            setFormData({
                adresse: deliveryData.idColis?.destinataireAdresse || '',
                idLivreur: deliveryData.idLivreur?._id || '',
                statut: deliveryData.statut || ''
            });

            // Récupérer la liste des livreurs pour le menu déroulant
            const fetchLivreurs = async () => {
                try {
                    const res = await axios.get('/api/livreurs');
                    setLivreurs(res.data.data || []);
                } catch (err) {
                    console.error("Erreur récup livreurs:", err);
                }
            };
            fetchLivreurs();
        }
    }, [isOpen, deliveryData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(deliveryData._id, formData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Modifier Livraison</h3>
                <p className="text-slate-400 text-sm mb-8 font-medium">Mise à jour du colis {deliveryData?.idColis?.codeSuivi}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Champ Adresse */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adresse de destination</label>
                        <input 
                            type="text"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            value={formData.adresse}
                            onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                            required
                        />
                    </div>

                    {/* Choix du Livreur */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Livreur assigné</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                            value={formData.idLivreur}
                            onChange={(e) => setFormData({...formData, idLivreur: e.target.value})}
                        >
                            <option value="">Sélectionner un livreur</option>
                            {livreurs.map(l => (
                                <option key={l._id} value={l._id}>{l.nomComplet}</option>
                            ))}
                        </select>
                    </div>

                    {/* Choix du Statut */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">État de la livraison</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                            value={formData.statut}
                            onChange={(e) => setFormData({...formData, statut: e.target.value})}
                        >
                            <option value="en attente">EN ATTENTE</option>
                            <option value="en cours">EN COURS</option>
                            <option value="livrée">LIVRÉ</option>
                            <option value="annulée">ANNULÉ</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-cyan-200 hover:bg-cyan-600 transition-all flex justify-center">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLivraisonModal;