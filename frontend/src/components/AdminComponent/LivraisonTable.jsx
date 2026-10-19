import React, { useMemo, useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender, 
    getPaginationRowModel 
} from '@tanstack/react-table';
import axios from '../../api/axios';

const LivraisonTable = ({ data, onToggleFilters, isFilterActive, refreshList, onEdit, onDelete, onViewDetails, onInfo }) => {
    const [menuStatutOuvert, setMenuStatutOuvert] = useState(null);
    const statutsOptions = ['EN ATTENTE', 'EN COURS', 'LIVRÉ', 'ANNULÉ'];

    const backendStatusMap = {
        'EN ATTENTE': 'en attente',
        'EN COURS': 'en cours',
        'LIVRÉ': 'livrée',
        'ANNULÉ': 'annulée'
    };

    const getStatutStyle = (statut) => {
        const s = statut?.toLowerCase();
        if (s === 'livrée') return 'bg-blue-50 text-blue-600 border-blue-100';
        if (s === 'annulée') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-cyan-50 text-cyan-600 border-cyan-100'; 
    };

    const handleUpdateStatut = async (id, label) => {
        try {
            await axios.patch(`/api/livraisons/${id}`, { statut: backendStatusMap[label] });
            await refreshList(); 
            setMenuStatutOuvert(null);
        } catch (error) { console.error(error); }
    };

    // --- CONFIGURATION DES COLONNES (CORRIGÉE) ---
    const columns = useMemo(() => [
        {
            header: 'ID Colis',
            accessorKey: 'idColis.codeSuivi',
            cell: info => <span className="font-bold text-cyan-700">{info.getValue()}</span>,
        },
        {
            header: 'Livreur',
            accessorKey: 'idLivreur.nomComplet',
            cell: info => (
                <p className="font-bold text-slate-800">{info.getValue() || "Non assigné"}</p>
            ),
        },
        {
            header: 'Destinataire',
            accessorKey: 'idColis.destinataireNomComplet',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-slate-600">{row.original.idColis?.destinataireNomComplet}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.original.idColis?.destinataireAdresse}</p>
                </div>
            ),
        },
        {
            header: 'Statut',
            accessorKey: 'statut',
            cell: ({ row }) => {
                const item = row.original;
                const isLocked = item.statut === 'livrée' || item.statut === 'annulée';
                return (
                    <div className="relative">
                        <button 
                            onClick={() => {
                                if (isLocked) {
                                    onInfo("Livraison Terminée", "Ce statut est verrouillé.");
                                    return;
                                }
                                setMenuStatutOuvert(menuStatutOuvert === item._id ? null : item._id);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatutStyle(item.statut)} ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} transition uppercase`}
                        >
                            <span className={`w-1 h-1 rounded-full ${item.statut === 'livrée' ? 'bg-blue-600' : 'bg-cyan-600'}`}></span>
                            {item.statut === 'en attente' ? 'EN COURS' : item.statut} ▼
                        </button>

                        {menuStatutOuvert === item._id && (
                            <div className="absolute z-20 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl py-1 animate-in zoom-in-95">
                                {statutsOptions.map((s) => (
                                    <button key={s} onClick={() => handleUpdateStatut(item._id, s)} className="block w-full text-left px-4 py-2 text-[10px] hover:bg-slate-50 font-bold text-slate-600">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                const isLocked = item.statut === 'livrée' || item.statut === 'annulée';
                return (
                    <div className="flex justify-end gap-2 pr-4">
                        <button onClick={() => onEdit(item)} className={`p-2 ${isLocked ? 'text-slate-200 cursor-not-allowed' : 'text-cyan-600 hover:bg-cyan-50 rounded-lg'}`} title="Modifier">
                            <i className="bi bi-pencil-square text-lg"></i>
                        </button>
                        <button onClick={() => isLocked ? onEdit(item) : onDelete(item._id, item.idColis?.codeSuivi)} className={`p-2 ${isLocked ? 'text-slate-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 rounded-lg'}`} title="Supprimer">
                            <i className="bi bi-trash text-lg"></i>
                        </button>
                        <button onClick={() => onViewDetails(item)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg" title="Détails">
                            <i className="bi bi-eye text-lg"></i>
                        </button>
                    </div>
                );
            }
        }
    ], [menuStatutOuvert, onEdit, onDelete, onViewDetails, onInfo]); // <--- DÉPENDANCES CORRIGÉES

    const table = useReactTable({
        data,
        columns,
        initialState: { pagination: { pageSize: 8 } },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between text-left">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Liste des expéditions</h2>
                <button onClick={onToggleFilters} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isFilterActive ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    <i className="bi bi-sliders"></i> Filtrer
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/30 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-4">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-8 py-5 text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</span>
                <div className="flex gap-1">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 text-slate-400 disabled:opacity-20"><i className="bi bi-chevron-left"></i></button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 text-slate-400 disabled:opacity-20"><i className="bi bi-chevron-right"></i></button>
                </div>
            </div>
        </div>
    );
};

export default LivraisonTable;