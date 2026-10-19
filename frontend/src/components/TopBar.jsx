import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            {/* Barre de recherche (Design Maquette) */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative flex-1">
                    {/* Icône de recherche Bootstrap */}
                    <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                    <input 
                        type="text"
                        placeholder="Rechercher un livreur, un colis..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Profil & Settings (Exactement comme demandé) */}
            <div className="flex items-center gap-4">
               
                
                {/* Lien Profil avec initiales "AD" et dégradé Cyan */}
                <Link 
                    to="/profile" 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm shadow-md"
                >
                    AD
                </Link>
            </div>
        </header>
    );
};

export default TopBar;