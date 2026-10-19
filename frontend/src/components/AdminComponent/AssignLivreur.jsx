import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const AssignLivreur = ({ colis, onClose, onAssign }) => {
  const [selectedLivreurId, setSelectedLivreurId] = useState('');
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // GET /api/livreurs/available - Récupérer les livreurs disponibles
  const chargerLivreurs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/livreurs/available');
      
      
      let livreursData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        
        livreursData = response.data.data.map(livreur => ({
          id: livreur._id,           
          nom: livreur.nomComplet,   
          telephone: livreur.telephone,
          nbLivraisonsAujourdhui: livreur.nombreLivraison || 0
        }));
      }
      
      console.log('Livreurs chargés:', livreursData.length);
      setLivreurs(livreursData);
      
    } catch (error) {
      console.error('Erreur chargement livreurs:', error);
      alert(error.response?.data?.error || 'Erreur lors du chargement des livreurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerLivreurs();
  }, []);

  // POST /api/colis/:id/assign - Assigner le colis au livreur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Reset de l'erreur

    if (!selectedLivreurId) {
      setErrorMsg('Veuillez sélectionner un livreur avant de valider.');
      return;
    }

    // --- SUPPRESSION DU window.confirm POUR UNE UX PLUS FLUIDE ---
    try {
      const res = await axios.post(`/api/colis/${colis.id}/assign`, {
        idLivreur: selectedLivreurId,
        dateEstimee: new Date().toISOString()
      });

      // --- ON ENVOIE LE MESSAGE AU PARENT POUR AFFICHER LA POPUP PRO ---
      onAssign(`Le colis #${colis?.code} a été assigné avec succès.`); 
      onClose();  
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Erreur lors de l\'assignation.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[120]">
        <div className="bg-white rounded-[2rem] p-10 text-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Recherche des livreurs...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Assigner le colis #{colis?.code}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-amber-100 text-amber-700 rounded-lg">
              {errorMsg}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sélectionner un livreur
            </label>
            <select
              value={selectedLivreurId}
              onChange={(e) => setSelectedLivreurId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              <option value=""> Choisir un livreur </option>
              {livreurs.map((livreur) => (
                <option key={livreur.id} value={livreur.id}>
                  {livreur.nom} - {livreur.telephone}
                  {livreur.nbLivraisonsAujourdhui !== undefined && 
                    ` (${livreur.nbLivraisonsAujourdhui}/10 livraisons aujourd'hui)`
                  }
                </option>
              ))}
            </select>
            {livreurs.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                 Aucun livreur disponible pour le moment
              </p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={livreurs.length === 0}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assigner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignLivreur;