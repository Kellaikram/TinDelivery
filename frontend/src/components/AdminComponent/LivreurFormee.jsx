import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

// Vérifie bien que setEditingLivreur est écrit ici dans les accolades
const LivreurForm = ({ refreshList, editingLivreur, setEditingLivreur, setShowForm }) => {
    const [formData, setFormData] = useState({ nomComplet: '', email: '', telephone: '', adresse: '' });

    useEffect(() => {
        if (editingLivreur) {
            setFormData({
                nomComplet: editingLivreur.nomComplet || '',
                email: editingLivreur.email || '',
                telephone: editingLivreur.telephone || '',
                adresse: editingLivreur.adresse || ''
            });
        }
    }, [editingLivreur]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (editingLivreur) {
            await axios.put(`/api/livreurs/${editingLivreur._id}`, formData);
        } else {
            // C'est ici que tu essaies de CRÉER un nouveau livreur
            await axios.post('/api/livreurs', formData);
        }

        // Si tout va bien
        setShowForm(false);
        setEditingLivreur(null);
        setFormData({ nomComplet: '', email: '', telephone: '', adresse: '' });
        await refreshList();
        alert("Opération effectuée avec succès !");

    } catch (err) {
        // C'EST ICI QU'ON GÈRE L'EMAIL QUI EXISTE DÉJÀ
        console.error("Erreur reçue :", err.response?.data);

        const rawError = err.response?.data?.error || "";
        let messageAffiche = "Une erreur est survenue lors de l'enregistrement.";

        // On cherche le mot magique "E11000" (Doublon MongoDB) dans l'erreur
        if (rawError.includes("E11000") || rawError.includes("duplicate key")) {
            messageAffiche = "Impossible de créer ce compte : cet email est déjà utilisé par un autre livreur.";
        } else if (rawError) {
            messageAffiche = rawError;
        }

        // On affiche l'alerte claire pour l'utilisateur
        alert(messageAffiche);
    }
};
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-gray-700 font-bold mb-4">{editingLivreur ? "Modifier le livreur" : "Nouveau Livreur"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <input placeholder="Nom" className="bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-sm" value={formData.nomComplet} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} required />
                <input placeholder="Email" type="email" className="bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input placeholder="Tél" className="bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-sm" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
                <input placeholder="Adresse" className="bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-sm" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} required />
                <button type="submit" className="bg-[#0f172a] text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-all text-sm h-[42px]">
                    {editingLivreur ? "Mettre à jour" : "Créer le compte"}
                </button>
            </form>
        </div>
    );
};

export default LivreurForm;