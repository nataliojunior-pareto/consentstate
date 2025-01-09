const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template.html';

import { createBanner } from 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/cmp.js';

async function initializeCMP() {
    try {
        await createBanner(url);
    } catch (error) {
        console.error('Erro ao inicializar CMP:', error);
    }
}

initializeCMP();
