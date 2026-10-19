import React, { useState } from 'react';
import axios from '../../api/axios';
import AssignLivreur from './AssignLivreur';

const ColisTable = ({ colis, refreshList, onEdit, setShowForm, onViewDetails, onDelete, onStatusChange, onSuccess}) => {
  const [menuStatutOuvert, setMenuStatutOuvert] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [selectedColisForAssign, setSelectedColisForAssign] = useState(null);

  const getStatutStyle = (statut) => {
    const styles = {
      'EN ATTENTE': 'bg-orange-500',
      'EN COURS': 'bg-blue-500',
      'LIVRÉ': 'bg-green-500',
      'ANNULÉ': 'bg-red-500',
    };
    return styles[statut] || 'bg-gray-500';
  };

  const statutsOptions = ['EN ATTENTE', 'EN COURS', 'LIVRÉ', 'ANNULÉ'];

  // Changer le statut
 

  // // Supprimer un colis
  // const handleDelete = async (id, code) => {
  //   if (window.confirm(`Êtes-vous sûr de vouloir supprimer le colis #${code} ?`)) {
  //     try {
  //       await axios.delete(`/api/colis/${id}`);
  //       alert(`Colis #${code} supprimé avec succès`);
  //       refreshList();
  //     } catch (error) {
  //       console.error('Erreur suppression:', error);
  //       alert(error.response?.data?.error || 'Erreur lors de la suppression');
  //     }
  //   }
  // };

  const handleOpenAssignPopup = (colis) => {
    setSelectedColisForAssign(colis);
    setShowAssignPopup(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID COLIS</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">DESTINATAIRE</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">DATE</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">STATUT</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {colis.map((colis) => (
              <tr key={colis.id || colis._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  #{colis.code}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-800">{colis.destinataire?.nom}</p>
                    <p className="text-xs text-slate-400">{colis.destinataire?.adresse}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {colis.dateCreation}
                </td>
                <td className="px-6 py-4 relative">
                  <button onClick={() =>
                      setMenuStatutOuvert(
                        menuStatutOuvert === (colis.id || colis._id)
                          ? null
                          : (colis.id || colis._id)
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatutStyle(colis.statut)} hover:opacity-80 transition cursor-pointer`}
                  >
                    {colis.statut}
                    <span className="ml-1 text-xs">▼</span>
                  </button>
                  {menuStatutOuvert === (colis.id || colis._id) && (
                    <div className="absolute z-10 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg">
                      {statutsOptions.map((statut) => (
                <button
                  key={statut}
                  // ON APPELLE LA FONCTION DU PARENT QUI OUVRE LA POPUP
                  onClick={() => {
                    onStatusChange(colis.id, statut, colis.statut);
                    setMenuStatutOuvert(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {statut}
                </button>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onEdit(colis);
                        setShowForm(true);
                      }}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      onClick={() => onDelete(colis.id, colis.code)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                   <button
                     onClick={() => handleOpenAssignPopup(colis)}
                      disabled={colis.statut !== 'EN ATTENTE'}
                       className={`p-2 rounded-lg transition-colors ${
                        colis.statut === 'EN ATTENTE'
                     ? 'text-amber-600 hover:bg-amber-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
                 }`}
            title={colis.statut === 'EN ATTENTE' ? 'Assigner un livreur' : 'Assignation non disponible (colis déjà livré, annulé ou en cours)'}
>
  <i className="bi bi-person-plus"></i>
</button>
                    <button
                      onClick={() => {
                        onViewDetails(colis);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Détails"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {colis.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aucun colis trouvé
          </div>
        )}
      </div>

      {/* Popup d'assignation */}
      {showAssignPopup && (
        <AssignLivreur
          colis={selectedColisForAssign}
          onClose={() => setShowAssignPopup(false)}
          onAssign={(message) => {
            setShowAssignPopup(false);
            refreshList();
            onSuccess(message|| "Livreur a été assigné avec succès");
          }}

        />
      )}
    </div>
  );
};

export default ColisTable;