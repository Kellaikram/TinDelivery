import React, { useMemo } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender, 
    getFilteredRowModel,
    getPaginationRowModel // 1. Import de la pagination
} from '@tanstack/react-table';

const MesLivraisonsTable = ({ data, onAction, onToggleFilters, isFilterActive, globalFilter }) => {

    const columns = useMemo(() => [
        {
            header: 'ID Colis',
            accessorKey: 'idColis.codeSuivi',
            cell: info => <span className="font-black text-cyan-700">#{info.getValue()}</span>,
        },
        {
            header: 'Adresse de Livraison',
            accessorKey: 'idColis.destinataireAdresse',
            cell: info => <p className="font-bold text-slate-700">{info.getValue()}</p>,
        },
        {
            header: 'Destinataire',
            accessorKey: 'idColis.destinataireNomComplet',
            cell: info => <p className="font-bold text-slate-600">{info.getValue()}</p>,
        },
        {
            header: 'Statut',
            accessorKey: 'statut',
            cell: ({ row }) => {
                const s = row.original.statut;
                const style = s === 'livrée' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              s === 'annulée' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-cyan-50 text-cyan-600 border-cyan-100';
                return (
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${style}`}>
                        <span className={`w-1 h-1 rounded-full ${s === 'livrée' ? 'bg-blue-600' : 'bg-cyan-600'}`}></span>
                        {s === 'en attente' ? 'EN COURS' : s}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {(row.original.statut === 'en cours' || row.original.statut === 'en attente') && (
                        <>
                            <button onClick={() => onAction(row.original, 'livrer')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100">LIVRÉE</button>
                            <button onClick={() => onAction(row.original, 'annuler')} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all">ANNULER</button>
                        </>
                    )}
                    <button onClick={() => onAction(row.original, 'details')} className="p-2 text-slate-300 hover:text-cyan-600"><i className="bi bi-eye-fill text-lg"></i></button>
                </div>
            )
        }
    ], [onAction]);

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        initialState: {
            pagination: {
                pageSize: 6, // 2. Nombre de lignes par page
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // 3. Activation du modèle de pagination
    });

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Liste des missions</h2>
                <button onClick={onToggleFilters} className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${isFilterActive ? 'bg-[#013c58] text-white' : 'bg-slate-50 text-slate-600'}`}>
                    <i className="bi bi-sliders"></i> {isFilterActive ? 'Fermer' : 'Filtrer'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/30">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
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
                                    <td key={cell.id} className="px-8 py-5 text-sm whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 4. BARRE DE PAGINATION (Design Maquette) */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    {/* Affichage des numéros de page */}
                    <div className="flex gap-1">
                        {table.getPageOptions().map((index) => (
                            <button
                                key={index}
                                onClick={() => table.setPageIndex(index)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    table.getState().pagination.pageIndex === index
                                    ? 'bg-[#013c58] text-white shadow-lg shadow-blue-900/20'
                                    : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MesLivraisonsTable;