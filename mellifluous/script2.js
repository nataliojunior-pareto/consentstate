const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template.html';

import { createBanner, start } from 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/bridge1.js';

async function initializeCMP() {
    try {
        await start();
        createBanner(url);
    } catch (error) {
        console.error('Erro ao inicializar CMP:', error);
    }
}

initializeCMP();
