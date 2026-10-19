import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000'
});

// --- AJOUT DE L'INTERCEPTEUR DE SÉCURITÉ ---
// Cette fonction s'exécute AUTOMATIQUEMENT avant chaque appel API (get, post, patch...)
instance.interceptors.request.use(
    (config) => {
        // 1. On récupère le token stocké dans le navigateur lors du login
        const token = localStorage.getItem('token');

        // 2. Si le token existe, on l'ajoute dans l'en-tête "Authorization"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;