import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import ColisForm from '../../components/AdminComponent/ColisForm';
import ColisTable from '../../components/AdminComponent/ColisTable';
import TopBar from '../../components/TopBar';
import ColisDetailsModal from '../../components/AdminComponent/ColisDetailsModal';
import ConfirmModal from '../../components/AdminComponent/ConfirmModal';

const GererColis = () => {
  const [colis, setColis] = useState([]);
  const [searchDestinataire, setSearchDestinataire] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingColis, setEditingColis] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedColis, setSelectedColis] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    action: null,
  });
  // --- 1. FONCTION POUR OUVRIR LA MODALE ---
  const handleViewDetails = (item) => {
    setSelectedColis(item);
    setShowDetails(true);
  };
  // 2. LOGIQUE DE STATUT PRO (Remplacement de window.confirm)
    const openStatusModal = (id, newStatut, oldStatut) => {
        setModalConfirm({
            show: true,
            title: "Changer le statut",
            message: `Voulez-vous passer le colis du statut "${oldStatut}" à "${newStatut}" ?`,
            type: 'info',
            action: () => confirmUpdateStatus(id, newStatut)
        });
    };

    const confirmUpdateStatus = async (id, newStatut) => {
        try {
            await axios.put(`/api/colis/${id}`, { status: newStatut.toLowerCase() });
            setModalConfirm({ ...modalConfirm, show: false });
            refreshList();
        } catch (error) { console.error(error); }
    };
    // 1. Ajoute cette fonction dans GererColis.jsx
    const showSuccessModal = (message) => {
        setModalConfirm({
            show: true,
            title: "Succès !",
            message: message,
            type: 'info', // Couleur bleue/cyan pour le succès
            action: () => setModalConfirm({ ...modalConfirm, show: false }) // Juste fermer au clic sur OK
        });
    };

  //  Récupérer les colis 
  const refreshList = async () => {
    try {
      const response = await axios.get('/api/colis');

      const data = response.data?.data || [];

      const formatted = Array.isArray(data)
        ? data.map((c) => ({
            id: c._id,
            code: c.codeSuivi,
            poids: c.poids,
  
            statut: c.status?.toUpperCase(),
            dateCreation: new Date(c.createdAt).toLocaleString(),
            expediteur: {
              nom: c.expediteurNomComplet,
              email: c.expediteurEmail,
              telephone: c.expediteurTelephone,
              adresse: c.expediteurAdresse,
            },
            destinataire: {
              nom: c.destinataireNomComplet,
              email: c.destinataireEmail,
              telephone: c.destinataireTelephone,
              adresse: c.destinataireAdresse,
            },
          }))
        : [];

      setColis(formatted);
    } catch (err) {
      console.error("Erreur récupération colis:", err);
      setColis([]);
    }
  };
  // Dans GererColis.jsx

const openDeleteModal = (id, code) => {
    setModalConfirm({
        show: true,
        title: "Supprimer le colis",
        message: `Êtes-vous sûr de vouloir supprimer définitivement le colis #${code} ? Cette action est irréversible.`,
        type: 'danger',
        // On définit l'action qui sera exécutée si on clique sur "Confirmer"
        action: () => confirmDelete(id) 
    });
};

const confirmDelete = async (id) => {
    try {
        await axios.delete(`/api/colis/${id}`);
        setModalConfirm({ ...modalConfirm, show: false }); // Fermer la modale
        refreshList(); // Recharger le tableau
    } catch (err) {
        console.error("Erreur suppression:", err);
    }
};


  useEffect(() => {
    refreshList();
  }, []);

  const safeColis = Array.isArray(colis) ? colis : [];

  //  Filtrage 
  const filteredColis = safeColis.filter(item => {
    
    const matchDestinataire = searchDestinataire === '' || 
      item.destinataire?.nom?.toLowerCase().includes(searchDestinataire.toLowerCase());

    const matchStatut = statutFilter === 'all' || 
      item.statut === statutFilter.toUpperCase();

    return matchDestinataire && matchStatut;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <div className="flex-1 ml-64">
        <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />

        <main className="p-8">
          {/* Titre et bouton */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Gestion des colis</h1>
              <p className="text-slate-500">Supervisez et gérez les expéditions en temps réel.</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingColis(null);
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg"
            >
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
              {showForm ? 'Fermer' : 'Créer un colis'}
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="mb-10">
              <ColisForm
                refreshList={refreshList}
                editingColis={editingColis}
                setEditingColis={setEditingColis}
                setShowForm={setShowForm}
                 onSuccess={showSuccessModal} 
              />
            </div>
          )}

          {/* Barre de recherche + Filtre par statut */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Rechercher par nom du destinataire..."
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchDestinataire}
                onChange={(e) => setSearchDestinataire(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="EN ATTENTE">En attente</option>
              <option value="EN COURS">En cours</option>
              <option value="LIVRÉ">Livré</option>
              <option value="ANNULÉ">Annulé</option>
            </select>
          </div>

          {/* Tableau */}
          <ColisTable
            colis={filteredColis}
            refreshList={refreshList}
            onEdit={setEditingColis}
            setShowForm={setShowForm}
            onDelete={openDeleteModal}
            onViewDetails={handleViewDetails} // --- 2. PASSER LA FONCTION EN PROPS ---
            onStatusChange={openStatusModal} // --- 3. PASSER LA FONCTION EN PROPS ---
              onSuccess={showSuccessModal}
           
          />

          {/* Info nombre de colis  */}
          <div className="mt-4 text-right text-sm text-slate-500">
            Affichage de {filteredColis.length} sur {colis.length} colis
          </div>
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

      <ColisDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        data={selectedColis}
      />
    </div>
  );
};

export default GererColis;