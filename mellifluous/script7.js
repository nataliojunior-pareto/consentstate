const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template2.html';

import { createBanner, start } from 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/bridge4.js';

async function initializeCMP() {
    try {
        await start();
        await createBanner(url);
        initializeBannerListeners();
    } catch (error) {
        console.error('Erro ao inicializar CMP:', error);
    }
}

function initializeBannerListeners() {
    // Capturando elementos
    const manageButton = document.getElementById('manage');
    const acceptButton = document.getElementById('accept-all');
    const manageSection = document.querySelector('.manage-options');
    const cancelManageButton = document.getElementById('cancel-manage');
    const saveManageButton = document.getElementById('save-manage');

    // Listener para o botão "Gerenciar"
    manageButton?.addEventListener('click', () => {
        manageSection.style.display = manageSection.style.display === 'none' ? 'block' : 'none';
    });

    // Listener para o botão "Aceitar"
    acceptButton?.addEventListener('click', () => {
        // Lógica para aceitar todos os cookies
        hideBanner();
    });

    // Listener para o botão "Cancelar" na seção de gerenciamento
    cancelManageButton?.addEventListener('click', () => {
        manageSection.style.display = 'none';
    });

    // Listener para o botão "Salvar" na seção de gerenciamento
    saveManageButton?.addEventListener('click', () => {
        // Lógica para salvar preferências
        manageSection.style.display = 'none';
        hideBanner();
    });
}

function hideBanner() {
    const banner = document.querySelector('.cookie-banner');
    banner?.classList.add('hidden');
    // Opcional: remover o banner após a animação
    setTimeout(() => {
        banner?.remove();
    }, 300); // tempo da animação CSS
}

initializeCMP();
