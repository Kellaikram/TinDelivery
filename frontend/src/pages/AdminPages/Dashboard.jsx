import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const [colis, setColis] = useState([]);
  const [totalReelColis, setTotalReelColis] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchColis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/colis');
      
      const colisData = response.data?.data || [];
      const totalReel = response.data?.pagination?.total || colisData.length;
      
      const formatted = colisData.map((c) => ({
        id: c._id,
        code: c.codeSuivi,
        poids: c.poids,
        statut: c.status?.toUpperCase() || 'EN ATTENTE',
        dateCreation: c.createdAt,
        livreurNom: c.livreurNom || 'Non assigné',
        expediteur: { nom: c.expediteurNomComplet },
        destinataire: { nom: c.destinataireNomComplet },
      }));

      setColis(formatted);
      setTotalReelColis(totalReel);
    } catch (err) {
      console.error('Erreur chargement colis:', err);
      setColis([]);
      setTotalReelColis(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColis();
  }, [fetchColis]);

  useEffect(() => {
    const handleFocus = () => fetchColis();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchColis]);
  // STATISTIQUES 
  const total = totalReelColis;
  const enAttente = colis.filter(c => c.statut === 'EN ATTENTE').length;
  const enCours = colis.filter(c => c.statut === 'EN COURS').length;
  const livres = colis.filter(c => c.statut === 'LIVRÉ').length;
  const annules = colis.filter(c => c.statut === 'ANNULÉ').length;

  const tauxReussite = total > 0 ? Math.round((livres / total) * 100) : 0;
  const pourcentEnAttente = total > 0 ? Math.round((enAttente / total) * 100) : 0;
  const pourcentEnCours = total > 0 ? Math.round((enCours / total) * 100) : 0;
  const pourcentLivres = total > 0 ? Math.round((livres / total) * 100) : 0;
  const pourcentAnnules = total > 0 ? Math.round((annules / total) * 100) : 0;
  // ACTIVITÉS RÉCENTES
  const getRecentActivities = () => {
    const actions = [];

    [...colis]
      .forEach(c => {
        let title = '', bgColor = '', icon = '', detail = '';
        const actionDate = new Date(c.dateCreation);
        const now = new Date();
        const diffMs = now - actionDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = '';
        if (diffMins < 1) timeAgo = 'À l\'instant';
        else if (diffMins < 60) timeAgo = `Il y a ${diffMins} min`;
        else if (diffHours < 24) timeAgo = `Il y a ${diffHours} h`;
        else timeAgo = `Il y a ${diffDays} j`;
        
        if (c.statut === 'LIVRÉ') {
          title = `Colis #${c.code} livré`;
          detail = `Livreur : ${c.livreurNom}`;
          bgColor = 'bg-emerald-50';
          icon = 'bi-check-circle-fill';
        } else if (c.statut === 'EN COURS') {
          title = `Colis #${c.code} en cours`;
          detail = `Destinataire : ${c.destinataire?.nom || 'N/A'}`;
          bgColor = 'bg-blue-50';
          icon = 'bi-truck';
        } else if (c.statut === 'EN ATTENTE') {
          title = `Nouveau colis #${c.code} créé`;
          detail = `Expéditeur : ${c.expediteur?.nom || 'N/A'}`;
          bgColor = 'bg-amber-50';
          icon = 'bi-box-seam';
        } else {
          title = `Colis #${c.code} annulé`;
          detail = `Annulation enregistrée`;
          bgColor = 'bg-red-50';
          icon = 'bi-x-circle-fill';
        }

        actions.push({
          id: c.id,
          title,
          detail,
          time: timeAgo,
          rawDate: actionDate.getTime(),
          bgColor,
          icon,
        });
      });

    return actions.sort((a, b) => b.rawDate - a.rawDate).slice(0, 6);
  };

  const recentActivities = getRecentActivities();

  // EXPORT PDF (jsPDF)
  const handleExportPDF = () => {
    const doc = new jsPDF();
   
    doc.setFontSize(22);
    doc.setTextColor(15, 76, 110);
    doc.text('TinDelivery - Rapport ', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);

    const currentDate = new Date().toLocaleString('fr-FR');
    doc.text(`Généré le : ${currentDate}`, 14, 30);

    // STATISTIQUES GLOBALES
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Statistiques Globales', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Total colis', total],
        ['En attente', enAttente],
        ['En cours', enCours],
        ['Livrés', livres],
        ['Annulés', annules],
        ['Taux de réussite', `${tauxReussite}%`],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 76, 110],
      },
      styles: {
        fontSize: 11,
      },
    });
    // PERFORMANCE
    doc.setFontSize(16);
    doc.text('Performance globale', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Colis livrés', `${livres} / ${total}`],
        ['Taux de réussite', `${tauxReussite}%`],
        ['Objectif atteint', tauxReussite >= 80 ? 'Oui' : ' Non'],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
      },
      styles: {
        fontSize: 11,
      },
    });

    // RÉPARTITION DES COLIS
    doc.setFontSize(16);
    doc.text('Répartition des colis', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Statut', 'Nombre', 'Pourcentage']],
      body: [
        [' En attente', enAttente, `${pourcentEnAttente}%`],
        [' En cours', enCours, `${pourcentEnCours}%`],
        [' Livrés', livres, `${pourcentLivres}%`],
        [' Annulés', annules, `${pourcentAnnules}%`],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 76, 110],
      },
      styles: {
        fontSize: 11,
      },
    });

    // DOWNLOAD
    doc.save(`rapport-dashboard-${Date.now()}.pdf`);
  };

  if (loading && colis.length === 0) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="admin" />
        <div className="flex-1 ml-64">
          <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />
          <div className="flex items-center justify-center h-96">
            <div className="text-slate-500">Chargement des données...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <div className="flex-1 ml-64">
        <TopBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />
        <main className="p-8">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Tableau de bord</h1>
              <p className="text-slate-500">Suivi des performances du système de livraison en temps réel</p>
             
            </div>
            <button
  onClick={handleExportPDF}
  className="flex items-center gap-2 bg-white border-2 border-red-500 text-red-600 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-red-50 transition"
>
  <i className="bi bi-filetype-pdf text-red-600"></i>
  Exporter PDF
</button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            <StatCard label="Total colis" value={total} icon="bi-box-seam" color="text-slate-600" />
            <StatCard label="En attente" value={enAttente} icon="bi-clock-history" color="text-amber-500" />
            <StatCard label="En cours" value={enCours} icon="bi-truck" color="text-cyan-600" />
            <StatCard label="Livrés" value={livres} icon="bi-check-circle-fill" color="text-emerald-600" />
            <StatCard label="Annulés" value={annules} icon="bi-x-circle-fill" color="text-red-500" />
          </div>

          {/* CHART + ACTIVITY */}
          <div className="grid grid-cols-3 gap-8">
            {/* CAMEMBERT */}
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Performance globale</h2>
                <p className="text-sm text-slate-500">Taux de réussite des livraisons</p>
              </div>
              
              <div className="flex items-center justify-center gap-16">
                <div className="relative w-80 h-80">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {[
                      { value: enAttente, color: "#f59e0b" },
                      { value: enCours, color: "#06b6d4" },
                      { value: livres, color: "#10b981" },
                      { value: annules, color: "#ef4444" }
                    ].reduce((acc, statut) => {
                      const offset = acc.offset;
                      const value = statut.value;
                      const percentage = total > 0 ? (value / total) * 100 : 0;
                      const angle = (percentage / 100) * 360;
                      if (value === 0) return { offset, elements: acc.elements };
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const startX = 50 + 45 * Math.cos((offset * Math.PI) / 180);
                      const startY = 50 + 45 * Math.sin((offset * Math.PI) / 180);
                      const endX = 50 + 45 * Math.cos(((offset + angle) * Math.PI) / 180);
                      const endY = 50 + 45 * Math.sin(((offset + angle) * Math.PI) / 180);
                      acc.elements.push(
                        <path
                          key={statut.color}
                          d={`M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={statut.color}
                          stroke="white"
                          strokeWidth="2.5"
                          opacity="0.95"
                        />
                      );
                      return { offset: offset + angle, elements: acc.elements };
                    }, { offset: 0, elements: [] }).elements}
                    <circle cx="50" cy="50" r="25" fill="white"/>
                    <text x="50" y="54" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-800">
                      {tauxReussite}%
                    </text>
                  </svg>
                </div>
                <div className="space-y-4">
                  <LegendItem color="#f59e0b" label="En attente" value={enAttente} percentage={pourcentEnAttente} />
                  <LegendItem color="#06b6d4" label="En cours" value={enCours} percentage={pourcentEnCours} />
                  <LegendItem color="#10b981" label="Livrés" value={livres} percentage={pourcentLivres} />
                  <LegendItem color="#ef4444" label="Annulés" value={annules} percentage={pourcentAnnules} />
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Taux de réussite</p>
                    <p className="text-4xl font-bold text-emerald-600">{tauxReussite}%</p>
                    <p className="text-xs text-slate-400">{livres} livrés sur {total} colis</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Appréciation</p>
                    <p className={`text-lg font-semibold ${tauxReussite >= 80 ? 'text-emerald-600' : tauxReussite >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {tauxReussite >= 80 ? 'Excellent' : tauxReussite >= 50 ? 'modérée' : 'faible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVITÉ RÉCENTE */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Activité récente</h2>
                
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${act.bgColor} transition hover:shadow-sm`}>
                      <div className="text-xl">
                        <i className={`bi ${act.icon}`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800">{act.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                        <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Aucune activité récente</p>
                    <button onClick={fetchColis} className="mt-2 text-cyan-600 text-sm">Rafraîchir</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-slate-100 rounded-lg">
        <i className={`bi ${icon} text-xl ${color}`}></i>
      </div>
      <span className="text-slate-500 font-medium text-sm">{label}</span>
    </div>
    <p className="text-4xl font-bold text-slate-800">{value}</p>
  </div>
);

const LegendItem = ({ color, label, value, percentage }) => (
  <div className="flex items-center justify-between min-w-[200px]">
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-slate-800">{value}</span>
      <span className="text-sm text-slate-400 w-12 text-right">{percentage}%</span>
    </div>
  </div>
);

export default Dashboard;