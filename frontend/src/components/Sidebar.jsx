import {React, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from './AdminComponent/ConfirmModal';
import axios from "../api/axios";
const Sidebar = ({ role = "admin" }) => { // Par défaut admin pour tes tests
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;
     const [showLogoutModal, setShowLogoutModal] = useState(false);
    // 3. Fonction de déconnexion
    const handleLogout = () => {
        // Supprimer les données du navigateur (localStorage)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        navigate('/');
    };


    // 1. Définition des menus selon le rôle
    const adminMenu = [
        { to: "/admin/dashboard", icon: "bi-grid-1x2", label: "Dashboard" },
        { to: "/admin/colis", icon: "bi-box-seam", label: "Colis" },
        { to: "/admin/livraisons", icon: "bi-truck", label: "Livraisons" },
        { to: "/admin/livreurs", icon: "bi-person-vcard", label: "Livreurs" },
    ];

    const livreurMenu = [
        { to: "/livreur/meslivraison", icon: "bi-truck", label: "Mes commandes" },
        { to: "/profile", icon: "bi-person-circle", label: "Mon Profil" },
    ];

    // On choisit quel menu afficher
    const menuItems = role === "admin" ? adminMenu : livreurMenu;
    // 2. Fonction qui s'exécute après confirmation
   const handleConfirmLogout = async () => {
    try {
        // Appeler l'API de logout d'Oussama
        await axios.post('/api/auth/logout'); 
    } catch (err) {
        console.error("Erreur lors de la déconnexion serveur");
    } finally {
        // Dans tous les cas, on nettoie le navigateur
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        navigate('/');
    }
};
    return (
        <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-20">
            
            {/* LOGO TIN DELIVERY */}
            <div className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0F172A] p-2 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <i className="bi bi-truck text-white text-xl"></i>
                    </div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">TinDelivery</h1>
                </div>
                {/* Badge de rôle sous le logo */}
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 ml-1">
                    {role === "admin" ? "Console Admin" : "Espace Livreur"}
                </p>
            </div>
            
            {/* NAVIGATION DYNAMIQUE */}
            <nav className="flex-1 px-4 space-y-2 mt-6">
                {menuItems.map((item, index) => (
                    <NavItem 
                        key={index}
                        to={item.to} 
                        icon={item.icon} 
                        label={item.label} 
                        active={isActive(item.to)} 
                    />
                ))}
            </nav>

            {/* BAS DE LA SIDEBAR */}
            <div className="p-6 border-t border-gray-50 space-y-2">
                <div className="flex items-center gap-4 px-4 py-3 text-slate-400 font-bold text-sm cursor-pointer hover:text-slate-600 hover:bg-gray-50 rounded-xl transition-all">
                    <i className="bi bi-question-circle text-lg"></i>
                    <span>Aide</span>
                </div>
                <div 
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 text-red-400 font-bold text-sm cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <i className="bi bi-box-arrow-left text-lg"></i>
                    <span>Déconnexion</span>
                </div>
            </div>
             {/* 4. LA MODALE DE CONFIRMATION RÉUTILISÉE */}
            <ConfirmModal 
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleConfirmLogout}
                title="Se déconnecter ?"
                message="Êtes-vous sûr de vouloir quitter votre session TinDelivery ?"
                type="danger" // En rouge car c'est une action de sortie
            />
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link 
        to={to} 
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            active 
            ? 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-100' 
            : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600 border border-transparent'
        }`}
    >
        <i className={`${icon} text-lg ${active ? 'text-cyan-700' : 'opacity-60'}`}></i>
        <span>{label}</span>
    </Link>
);

export default Sidebar;