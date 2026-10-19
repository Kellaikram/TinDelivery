import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MessageModal from '../components/AdminComponent/MessageModal';

// 1. ICÔNES (Utilisation des marqueurs Leaflet standards pour éviter les bugs d'images)
const agenceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/9162/9162740.png',
    iconSize: [35, 50], iconAnchor: [48, 41],
});

const camionIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/15611/15611426.png',
    iconSize: [25, 41], iconAnchor: [12, 31],
});

// COMPOSANT POUR DÉPLACER LA CARTE DYNAMIQUEMENT
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 14);
    return null;
}

const ClientDashboard = () => {
    const [code, setCode] = useState("");
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '' });

    const agenceCoords = [31.5173, -5.5348];

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/colis/track/${code}`);
            if (res.data) setTrackingData(res.data);
        } catch (err) {
            setTrackingData(null);
            setMsgModal({ show: true, title: "Erreur", message: "Code de suivi introuvable." });
        } finally { setLoading(false); }
    };

    // --- POSITION DU CAMION ---
    // On prend la position exacte renvoyée par le Backend
    const camionPos = trackingData?.position 
        ? [trackingData.position.latitude, trackingData.position.longitude] 
        : [agenceCoords[0] + 0.0005, agenceCoords[1] + 0.0005];

    return (
        <div className="h-screen flex flex-col bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden text-left">
            {/* Header */}
            <nav className="h-[70px] flex items-center justify-between px-10 bg-white border-b border-slate-200 shrink-0">
                <div className="text-xl font-black text-[#013c58] tracking-tighter flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#013c58] rounded-lg flex items-center justify-center text-white text-[10px] font-bold">TD</div>
                    TinDelivery Tinghir
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700 border-b-2 border-cyan-700">Suivi Client</div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
                {/* Barre de recherche */}
                <form onSubmit={handleTrack} className="w-full max-w-xl flex gap-3 bg-white p-2 rounded-[1.5rem] shadow-xl border border-slate-200 mb-8 shrink-0">
                    <div className="flex-1 flex items-center px-4 gap-3">
                        <i className="bi bi-search text-slate-400"></i>
                        <input type="text" placeholder="CODE DE SUIVI..." className="w-full outline-none font-black text-slate-800 bg-transparent py-1 uppercase text-xs" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                    </div>
                    <button type="submit" className="bg-[#013c58] text-white px-8 py-2.5 rounded-[1.2rem] font-black text-[10px] uppercase">Suivre</button>
                </form>

                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                    {/* GAUCHE : Statut & Timeline */}
                    <div className="lg:col-span-4 flex flex-col gap-5 overflow-hidden">
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 uppercase">Statut actuel</p>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg ${trackingData ? 'bg-[#013c58] text-white' : 'bg-slate-50 text-slate-300'}`}>
                                    <i className="bi bi-truck"></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase leading-tight">{trackingData?.colis?.status || "Attente"}</h3>
                                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-tighter">Mise à jour GPS</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex-1 overflow-y-auto">
                            <h4 className="text-[9px] font-black text-slate-800 mb-5 uppercase tracking-[0.2em]">Parcours</h4>
                            {trackingData ? (
                                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-[1px] before:bg-slate-100">
                                    {trackingData.historique.map((step, i) => (
                                        <div key={i} className="flex gap-4 relative z-10">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${step.done ? 'bg-cyan-600' : 'bg-slate-100'}`}>
                                                {step.done && <i className="bi bi-check text-white text-[8px]"></i>}
                                            </div>
                                            <div className={step.done ? 'opacity-100' : 'opacity-30'}>
                                                <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{step.status}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{step.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-10"><i className="bi bi-clock-history text-3xl mb-1"></i><p className="text-[8px] font-black uppercase">Vide</p></div>
                            )}
                        </div>
                    </div>

                    {/* DROITE : CARTE */}
                    <div className="lg:col-span-8 flex flex-col gap-5 overflow-hidden">
                        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm h-[320px] relative overflow-hidden z-0">
                            <MapContainer center={agenceCoords} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '1.8rem' }} zoomControl={false}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                
                                {/* On recentre la carte sur le camion */}
                                <ChangeView center={camionPos} />

                                <Marker position={agenceCoords} icon={agenceIcon} />
                                
                                {trackingData && (
                                    <Marker position={camionPos} icon={camionIcon}>
                                        <Popup><span className="font-bold text-[10px] uppercase">Livreur : {trackingData.colis.status}</span></Popup>
                                    </Marker>
                                )}

                                {trackingData && (
                                    <Polyline positions={[agenceCoords, camionPos]} color="#0891b2" weight={4} dashArray="10, 10" />
                                )}
                            </MapContainer>
                        </div>

                        {/* Boxes Poids/Service */}
                        <div className="grid grid-cols-2 gap-5 shrink-0 text-slate-900">
                            <div className="bg-white p-6 rounded-[1.8rem] border border-slate-200 shadow-sm flex justify-between items-center">
                                <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Poids total</p><p className="text-xl font-black">{trackingData ? trackingData.colis.poids : "--"} kg</p></div>
                                <i className="bi bi-box-seam text-2xl text-slate-200"></i>
                            </div>
                            <div className="bg-[#013c58] p-6 rounded-[1.8rem] shadow-xl flex justify-between items-center text-white">
                                <div><p className="text-[8px] font-black opacity-50 uppercase mb-1">Logistique</p><p className="text-xl font-black">Standard</p></div>
                                <i className="bi bi-lightning-charge-fill text-2xl text-white/20"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="h-[60px] bg-white border-t border-slate-200 shrink-0 flex items-center justify-between px-10">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.1em]">© 2024 TinDelivery Terminal.</p>
                <div className="flex gap-8 text-[9px] font-black uppercase text-slate-900"><a href="#">Légal</a><a href="#">Support</a></div>
            </footer>
            <MessageModal isOpen={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type="error" />
        </div>
    );
};

export default ClientDashboard;