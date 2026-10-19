import React from 'react';

const StatCard = ({ label, value, icon, color, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
                {/* Utilisation des icônes Bootstrap */}
                <i className={`bi ${icon} text-xl`}></i>
            </div>
            {/* Affichage optionnel de la tendance (ex: +12%) */}
            {trend && (
                <span className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                    {trend}
                </span>
            )}
        </div>
        <p className="text-slate-500 font-medium text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
);

export default StatCard;