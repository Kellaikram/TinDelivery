import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Connexion = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Appel API Login (Point de terminaison d'Oussama)
            const res = await axios.post('/api/auth/login', { 
              email,
              motDePasse: password
             });
            
            // 2. Stockage du Token et des infos (localStorage)
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // 3. Redirection selon le rôle (Critère de ta User Story)
            if (user.role === 'admin') {
                navigate('/admin/livraisons');
            } else {
                navigate('/livreur/meslivraison');
            }

        } catch (err) {
            setError(err.response?.data?.error || "Identifiants incorrects. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl shadow-cyan-900/5 border border-white">
                
                {/* LOGO & HEADER (Design Maquette Page 15) */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#013c58] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20">
                        <i className="bi bi-truck text-white text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Connexion</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Gérez vos flux logistiques en toute sérénité.</p>
                </div>

                {/* FORMULAIRE */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-shake">
                            <i className="bi bi-exclamation-circle mr-2"></i> {error}
                        </div>
                    )}

                    {/* Champ Email */}
                    <div className="text-left">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse Email</label>
                        <div className="relative">
                            <i className="bi bi-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input 
                                type="email" 
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="nom@tindelivery.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Champ Mot de passe */}
                    <div className="text-left">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
                            <button type="button" className="text-[10px] font-black text-cyan-600 uppercase hover:underline">Oublié ?</button>
                        </div>
                        <div className="relative">
                            <i className="bi bi-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-cyan-600 transition-colors"
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Option Se souvenir */}
                    <div className="flex items-center gap-3 ml-1">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-cyan-600 focus:ring-cyan-500" />
                        <label htmlFor="remember" className="text-xs font-bold text-slate-400">Se souvenir de moi</label>
                    </div>

                    {/* Bouton de validation */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#013c58] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>Se connecter <i className="bi bi-arrow-right"></i></>
                        )}
                    </button>
                </form>

                {/* FOOTER MAQUETTE */}
                <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col gap-4 text-center">
                    <div className="flex justify-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <a href="#" className="hover:text-cyan-600">Support</a>
                        <a href="#" className="hover:text-cyan-600">Confidentialité</a>
                        <a href="#" className="hover:text-cyan-600">Conditions</a>
                    </div>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">© 2024 TinDelivery. La Clarté Architecturale.</p>
                </div>
            </div>

        </div>
    );
};

export default Connexion;