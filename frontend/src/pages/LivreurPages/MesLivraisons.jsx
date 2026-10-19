import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/AdminComponent/StatCard';
import ConfirmModal from '../../components/AdminComponent/ConfirmModal';
import DetailsModal from '../../components/AdminComponent/LivraisonDetailsModal';
import MesLivraisonsTable from '../../components/LivreurComponent/MesLivraisonsTable';

const MesLivraisons = () => {
    // 1. States
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statutFilter, setStatutFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
     const [statsData, setStatsData] = useState({ total: 0, enAttente: 0, enCours: 0, livrees: 0 });

    // Modales
    const [modalConfirm, setModalConfirm] = useState({ show: false, id: null, title: '', message: '', type: 'info', action: null });
    const [modalDetails, setModalDetails] = useState({ show: false, data: null });
    // 1. Récupérer les stats spécifiques du livreur
    //const resStats = await axios.get('/api/livraisons/livreur/stats');
    // 2. Fonctions de récupération
    const refreshList = async () => {
        try {
            setLoading(true);
             // On appelle l'API des livraisons ET l'API des stats livreur d'Oussama
            const [resLiv, resStats] = await Promise.all([
                 axios.get('/api/livreurs/mes-livraisons'), // Pour le moment on filtre sur le front, plus tard Oussama créera /api/livraisons/mes-livraisons
                axios.get('/api/livraisons/livreur/stats') // Route d'Oussama
            ]);

            setLivraisons(resLiv.data.data || resLiv.data || []);
            setStatsData(resStats.data.data || resStats.data);
        } catch (err) {
            console.error("Erreur API :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshList();
    }, []);

     // 3. Logique de mise à jour du statut (UTILISATION DES ROUTES D'OUSSAMA)
    const updateStatus = async (id, type) => {
        try {
            // Mapping vers les routes exactes d'Oussama
            let endpoint = '';
            if (type === 'livrée') endpoint = `/api/livraisons/livreur/${id}/livree`;
            if (type === 'annulée') endpoint = `/api/livraisons/livreur/${id}/annulee`;

            await axios.patch(endpoint, {});
            
            setModalConfirm({ ...modalConfirm, show: false });
            await refreshList(); // Recharger les données et les compteurs
        } catch (err) {
            alert(err.response?.data?.error || "Erreur lors de la mise à jour");
        }
    };

    // 4. Gestionnaire d'actions du tableau
    const handleTableAction = (item, type) => {
        if (type === 'details') {
            setModalDetails({ show: true, data: item });
        } else if (type === 'livrer') {
            setModalConfirm({
                show: true,
                title: "Confirmer la livraison",
                message: `Confirmez-vous que le colis ${item.idColis?.codeSuivi} est livré ?`,
                type: 'info',
                action: () => updateStatus(item._id, 'livrée')
            });
        } else if (type === 'annuler') {
            setModalConfirm({
                show: true,
                title: "Annuler la mission",
                message: `Le colis ${item.idColis?.codeSuivi} a-t-il été refusé ?`,
                type: 'danger',
                action: () => updateStatus(item._id, 'annulée')
            });
        }
    };

    // 5. Filtrage
    const filteredLivraisons = livraisons.filter(item => {
        const matchSearch = 
            item.idColis?.codeSuivi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.idColis?.destinataireNomComplet?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchStatut = statutFilter === "all" || 
                         (statutFilter === "en cours" && (item.statut === "en cours" || item.statut === "en attente")) ||
                         (item.statut === statutFilter);

        return matchSearch && matchStatut;
    });

    const stats = {
        total: livraisons.length,
        enCours: livraisons.filter(l => l.statut === "en cours" || l.statut === "en attente").length,
        livrees: livraisons.filter(l => l.statut === "livrée").length
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar role="livreur" />
            
            <div className="flex-1 ml-64">
                <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />
                
                <main className="p-8 text-left">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Mes Livraisons</h1>
                        <p className="text-slate-500 font-medium">Suivi de vos missions quotidiennes</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <StatCard label="Total Missions" value={stats.total} icon="bi-box" color="text-slate-600" />
                        <StatCard label="En Cours" value={stats.enCours} icon="bi-truck" color="text-cyan-600" />
                        <StatCard label="Livrées" value={stats.livrees} icon="bi-check2-circle" color="text-emerald-600" />
                    </div>

                    {showFilters && (
                        <div className="mb-6 p-6 bg-white rounded-3xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                            <select 
                                className="px-4 py-2 bg-slate-50 border rounded-xl text-sm font-bold outline-none"
                                value={statutFilter}
                                onChange={(e) => setStatutFilter(e.target.value)}
                            >
                                <option value="all">Toutes les missions</option>
                                <option value="en cours">En cours</option>
                                <option value="livrée">Livrées</option>
                                <option value="annulée">Annulées</option>
                            </select>
                        </div>
                    )}

                    <MesLivraisonsTable 
                        data={filteredLivraisons} 
                        globalFilter={searchQuery}
                        isFilterActive={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onAction={handleTableAction}
                    />
                </main>
            </div>

            <ConfirmModal 
                isOpen={modalConfirm.show} 
                onClose={() => setModalConfirm({ ...modalConfirm, show: false })} 
                onConfirm={modalConfirm.action} 
                title={modalConfirm.title} 
                message={modalConfirm.message} 
                type={modalConfirm.type} 
            />

            <DetailsModal 
                isOpen={modalDetails.show} 
                onClose={() => setModalDetails({ ...modalDetails, show: false })} 
                data={modalDetails.data} 
            />
        </div>
    );
};

export default MesLivraisons;