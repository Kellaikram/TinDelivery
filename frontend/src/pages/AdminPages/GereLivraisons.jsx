import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import axios from '../../api/axios';
import StatCard from '../../components/AdminComponent/StatCard';
import LivraisonTable from '../../components/AdminComponent/LivraisonTable';
import ConfirmModal from '../../components/AdminComponent/ConfirmModal';
import DetailsModal from '../../components/AdminComponent/LivraisonDetailsModal';
import EditLivraisonModal from '../../components/AdminComponent/EditLivraisonModal';

const GereLivraisons = () => {
    // States des données
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);

    // States des Filtres (Mise à jour pour inclure la barre de recherche spécifique)
    const [searchQuery, setSearchQuery] = useState(""); // Pour la TopBar
    const [searchDestinataire, setSearchDestinataire] = useState(""); // Pour le bloc filtre
    const [statutFilter, setStatutFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Modales
    const [modalConfirm, setModalConfirm] = useState({ show: false, id: null, code: '', action: null });
    const [modalDetails, setModalDetails] = useState({ show: false, data: null });
    const [modalEdit, setModalEdit] = useState({ show: false, data: null });

    const refreshList = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/livraisons');
            setLivraisons(res.data.data || res.data || []);
        } catch (err) {
            console.error("Erreur API :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshList(); }, []);
    // Fonction pour afficher le message de blocage
const showLockedActionMessage = (action) => {
    setModalConfirm({
        show: true,
        title: "Action Verrouillée",
        message: `Cette livraison est déjà terminée (livrée ou annulée). Il est impossible de la ${action} pour garantir l'intégrité de l'historique.`,
        type: 'info', // Couleur bleue/info au lieu de rouge
        action: () => setModalConfirm({ ...modalConfirm, show: false }) // Bouton OK ferme juste la modale
    });
};


    // --- LOGIQUE DE FILTRAGE (CORRIGÉE : EXACTEMENT COMME DANS COLIS) ---
    const filteredLivraisons = livraisons.filter(item => {
        // 1. Match TopBar (Code ou Nom)
        const matchGeneral = 
            item.idColis?.codeSuivi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.idColis?.destinataireNomComplet?.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Match Recherche Destinataire spécifique (le nouveau champ)
        const matchDestinataire = item.idColis?.destinataireNomComplet?.toLowerCase().includes(searchDestinataire.toLowerCase());

        // 3. Match Statut (Comparaison stricte avec les valeurs backend)
        const matchStatut = statutFilter === "all" || item.statut === statutFilter;

        return matchGeneral && matchDestinataire && matchStatut;
    });

    // Stats pour les cartes
    const stats = {
        total: livraisons.length,
        enCours: livraisons.filter(l => l.statut === "en cours" || l.statut === "en attente").length,
        reussies: livraisons.filter(l => l.statut === "livrée").length,
        annulees: livraisons.filter(l => l.statut === "annulée").length,
    };

    // Fonctions API
    const confirmDelete = async (id) => {
        try {
            await axios.delete(`/api/livraisons/${id}`);
            setModalConfirm({ ...modalConfirm, show: false });
            await refreshList();
        } catch (err) {  setModalConfirm({ ...modalConfirm, show: false });
        // On récupère le message d'Oussama ou on met le nôtre
        const backendMsg = err.response?.data?.error || "supprimer";
        showLockedActionMessage(backendMsg === "supprimer" ? "supprimer" : "réaliser cette action sur"); }
    };
    // --- LOGIQUE DE MODIFICATION (GDLT-71) ---
const handleEditRequest = (item) => {
    // On vérifie le statut avant d'ouvrir la modale d'édition
    if (item.statut === 'livrée' || item.statut === 'annulée') {
        showLockedActionMessage("modifier");
    } else {
        setModalEdit({ show: true, data: item });
    }
};

    const handleUpdate = async (id, updatedData) => {
        try {
            await axios.patch(`/api/livraisons/${id}`, updatedData);
            setModalEdit({ show: false, data: null });
            await refreshList();
            
        } catch (err) { alert("Erreur modification"); }
    };

    // On calcule la performance à partir des stats déjà reçues ou calculées
const calculatePerformance = () => {
    if (!stats.total || stats.total === 0) return 0;
    
    // Formule : (Livraisons Réussies / Total) * 100
    const percentage = (stats.reussies / stats.total) * 100;
    
    // On arrondit à 1 chiffre après la virgule (ex: 98.2)
    return percentage.toFixed(1);
};

const perfValue = calculatePerformance();

    return (
        <div className='flex min-h-screen bg-slate-50'>
            <Sidebar role="admin" />
            <div className='flex-1 ml-64'>
                <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery}/>
                <main className='p-8'>
                    <div className='mb-8'>
                        <h1 className="text-3xl font-bold text-slate-800">Supervision des livraisons</h1>
                        <p className="text-slate-500">Gérez et suivez l'état des colis en temps réel.</p>
                    </div>

                   {/* Prochaine étape : Les cartes statistiques et le Tableau */}
           <div className="grid grid-cols-4 gap-6 mb-8">
              <StatCard label="TOTAL EXPÉDITIONS" value={stats.total} icon="bi-box" color="text-slate-600" trend="+12%" />
            <StatCard label="COLIS EN TRANSIT" value={stats.enCours} icon="bi-clock" color="text-slate-600" trend="En cours" />
            <StatCard label="LIVRAISONS RÉUSSIES" value={stats.reussies} icon="bi-check-circle" color="text-slate-600" trend="Aujourd'hui" />
               {/* Carte Performance Spéciale (Design de la maquette) */}
            <div className="bg-[#013c58] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-bold opacity-60 uppercase mb-4 tracking-wider">Performance</p>
                    <p className="text-3xl font-bold mb-2">{perfValue}%</p>
                    <p className="text-[10px] opacity-70">Taux de ponctualité global</p>
                    {/* BARRE DE PROGRESSION DYNAMIQUE */}
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-4">
                        <div 
                            className="bg-white h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${perfValue}%` }} // La barre s'adapte au pourcentage
                        ></div>
                    </div>
                </div>
                {/* Petit design de fond pour la carte */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>
            </div>

                    {/* BARRE DE FILTRES : COMME GESTION COLIS */}
                    {showFilters && (
                        <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="relative flex-1 max-w-md">
                                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom du destinataire..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={searchDestinataire}
                                    onChange={(e) => setSearchDestinataire(e.target.value)}
                                />
                            </div>

                            <select
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 cursor-pointer outline-none focus:ring-2 focus:ring-cyan-500"
                                value={statutFilter}
                                onChange={(e) => setStatutFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                {/* <option value="en attente">En attente</option> */}
                                <option value="en cours">En cours</option>
                                <option value="livrée">Livrée</option>
                                <option value="annulée">Annulée</option>
                            </select>
                        </div>
                    )}

                    <LivraisonTable 
                        data={filteredLivraisons} 
                        onToggleFilters={() => setShowFilters(!showFilters)} 
                        isFilterActive={showFilters}
                        refreshList={refreshList}
                        onDelete={(id, code) => setModalConfirm({ show: true, id, code, action: () => confirmDelete(id), title: "Supprimer", message: `Voulez-vous supprimer ${code} ?`, type: 'danger' })}
                        onViewDetails={(item) => setModalDetails({ show: true, data: item })}
                        onEdit={(item) => setModalEdit({ show: true, data: item })} 
                        onEdit={handleEditRequest}
                        onInfo={showLockedActionMessage}
                    />
                </main>
            </div>

            <ConfirmModal isOpen={modalConfirm.show} onClose={() => setModalConfirm({ ...modalConfirm, show: false })} onConfirm={modalConfirm.action} title={modalConfirm.title} message={modalConfirm.message} type={modalConfirm.type} />
            <DetailsModal isOpen={modalDetails.show} onClose={() => setModalDetails({ ...modalDetails, show: false })} data={modalDetails.data} />
            <EditLivraisonModal isOpen={modalEdit.show} onClose={() => setModalEdit({ show: false, data: null })} deliveryData={modalEdit.data} onUpdate={handleUpdate} />
        </div>
    );
};

export default GereLivraisons;