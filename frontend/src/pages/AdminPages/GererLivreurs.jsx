import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import axios from '../../api/axios';
import StatCard from '../../components/AdminComponent/StatCard';
import LivreurTable from '../../components/AdminComponent/LivreurTable';
import ConfirmModal from '../../components/AdminComponent/ConfirmModal';
import EditLivreurModal from '../../components/AdminComponent/EditLivreurModal';
import MessageModal from '../../components/AdminComponent/MessageModal';

const GererLivreurs = () => {
    const [livreurs, setLivreurs] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [searchNom, setSearchNom] = useState(""); 
    const [statutFilter, setStatutFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // États des modales
    const [modalConfirm, setModalConfirm] = useState({ show: false, id: null, nom: '', action: null });
    const [modalEdit, setModalEdit] = useState({ show: false, data: null });
    const [modalError, setModalError] = useState({ show: false, title: '', message: '', type: 'error' });

    const refreshList = async () => {
        try {
            const res = await axios.get('/api/livreurs');
            setLivreurs(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { refreshList(); }, []);

    // --- LOGIQUE DE CHANGEMENT DE STATUT (DÉPLACÉE ICI) ---
    const handleToggleStatus = async (livreur) => {
        try {
            await axios.patch(`/api/livreurs/${livreur._id}/status`);
            refreshList();
        } catch (err) {
            // GESTION DE L'ERREUR MÉTIER : LIVREUR ASSIGNÉ
            setModalError({
                show: true,
                title: "Action Impossible",
                message: "Ce livreur ne peut pas être désactivé car il est actuellement responsable de livraisons en cours. Veuillez d'abord clôturer ses missions.",
                type: "error"
            });
        }
    };

    const filteredLivreurs = livreurs.filter(item => {
        const matchGeneral = item.nomComplet?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchNomLocal = item.nomComplet?.toLowerCase().includes(searchNom.toLowerCase());
        const matchStatut = statutFilter === "all" || item.status === statutFilter;
        return matchGeneral && matchNomLocal && matchStatut;
    });

    const stats = {
        total: livreurs.length,
        actifs: livreurs.filter(l => l.status === "actif").length,
        inactifs: livreurs.filter(l => l.status === "inactif").length,
        disponibles: livreurs.filter(l => l.disponibilite).length,
    };

    const handleSave = async (formData) => {
        try {
            if (modalEdit.data) { await axios.put(`/api/livreurs/${modalEdit.data._id}`, formData); }
            else { await axios.post('/api/livreurs', formData); }
            setModalEdit({ show: false, data: null });
            refreshList();
            setModalError({ show: true, title: "Succès", message: "Opération réussie !", type: "success" });
        } catch (err) {
            if (err.response?.status === 400 || err.response?.data?.error?.includes("duplicate")) {
                setModalError({ show: true, title: "Compte existant", message: "Cet email est déjà utilisé par un autre livreur.", type: "error" });
            } else { 
                setModalError({ show: true, title: "Erreur technique", message: "Une erreur est survenue lors de l'enregistrement.", type: "error" });
            }
        }
    };

    return (
        <div className='flex min-h-screen bg-slate-50'>
            <Sidebar role="admin" />
            <div className='flex-1 ml-64'>
                <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery}/>
                <main className='p-8 text-left'>
                    <div className='flex justify-between items-start mb-8'>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion de la Flotte</h1>
                            <p className="text-slate-500 text-sm font-medium">Contrôlez l'activité de vos livreurs en temps réel.</p>
                        </div>
                        <button onClick={() => setModalEdit({ show: true, data: null })} className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all">
                            <i className="bi bi-person-plus-fill"></i> Nouveau Livreur
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <StatCard label="TOTAL LIVREURS" value={stats.total} icon="bi-people" color="text-slate-600" />
                        <StatCard label="COMPTES ACTIFS" value={stats.actifs} icon="bi-shield-check" color="text-blue-600" />
                        <StatCard label="COMPTES INACTIFS" value={stats.inactifs} icon="bi-shield-slash" color="text-rose-500" />
                        <StatCard label="DISPONIBLES" value={stats.disponibles} icon="bi-truck" color="text-emerald-600" />
                    </div>

                    {showFilters && (
                        <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="relative flex-1 max-w-md">
                                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input type="text" placeholder="Rechercher par nom..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" value={searchNom} onChange={(e) => setSearchNom(e.target.value)} />
                            </div>
                            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500" value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
                                <option value="all">Tous les statuts</option>
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </select>
                        </div>
                    )}

                    <LivreurTable 
                        data={filteredLivreurs} 
                        onToggleFilters={() => setShowFilters(!showFilters)} 
                        isFilterActive={showFilters} 
                        onEdit={(item) => setModalEdit({ show: true, data: item })} 
                        onToggleStatus={handleToggleStatus}
                        onDelete={(id, nom) => setModalConfirm({ 
                            show: true, id, nom, 
                            action: () => { axios.delete(`/api/livreurs/${id}`).then(() => { refreshList(); setModalConfirm({show:false}) }) }, 
                            title: "Suppression", 
                            message: `Voulez-vous supprimer le livreur ${nom} ?`, 
                            type: 'danger' 
                        })} 
                    />
                </main>
            </div>
            
            <ConfirmModal isOpen={modalConfirm.show} onClose={() => setModalConfirm({ ...modalConfirm, show: false })} onConfirm={modalConfirm.action} title={modalConfirm.title} message={modalConfirm.message} type={modalConfirm.type} />
            <EditLivreurModal isOpen={modalEdit.show} onClose={() => setModalEdit({ show: false, data: null })} livreurData={modalEdit.data} onSave={handleSave} />
            <MessageModal isOpen={modalError.show} onClose={() => setModalError({ ...modalError, show: false })} title={modalError.title} message={modalError.message} type={modalError.type} />
        </div>
    );
};
export default GererLivreurs;