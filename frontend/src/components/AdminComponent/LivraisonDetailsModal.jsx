import React from 'react';

const DetailsModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Design de fond décoratif */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-100">
                        <i className="bi bi-box-seam text-xl"></i>
                    </div>
                    Détails Livraison
                </h3>

                <div className="space-y-8 text-left">
                    {/* Ligne Code & Statut */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Code de suivi</p>
                            <p className="font-black text-cyan-600">{data.idColis?.codeSuivi || "N/A"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Actuel</p>
                            <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase border border-slate-200">
                                {data.statut === 'en attente' ? 'EN COURS' : data.statut}
                            </span>
                        </div>
                    </div>

                    {/* Bloc Destinataire (Correction des chemins) */}
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="bi bi-person-circle text-cyan-500"></i> Informations Destinataire
                        </p>
                        <p className="text-lg font-black text-slate-800">{data.idColis?.destinataireNomComplet || "Nom non renseigné"}</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">
                            {data.idColis?.destinataireAdresse || "Adresse non renseignée"}
                        </p>
                    </div>

                    {/* Bloc Livreur (Maintenant peuplé par l'API) */}
                    <div className="pl-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="bi bi-truck text-cyan-500"></i> Livreur assigné
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 border-2 border-white shadow-sm">
                                {data.idLivreur?.nomComplet ? data.idLivreur.nomComplet.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-700">
                                    {data.idLivreur?.nomComplet || "Non encore assigné"}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    {data.idLivreur?.email || "En attente d'assignation"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bouton de fermeture plus moderne */}
                <button 
                    onClick={onClose} 
                    className="w-full mt-10 py-4 bg-[#013c58] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                    FERMER LE DOSSIER
                </button>
            </div>
        </div>
    );
};

export default DetailsModal;