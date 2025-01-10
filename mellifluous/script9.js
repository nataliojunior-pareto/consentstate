const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template3.html';

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
    const overlay = document.querySelector('.consent-overlay');
    const acceptAllInManage = document.querySelector('.btn-accept-all');
    const rejectAllInManage = document.querySelector('.btn-reject-all');

    // Listener para o botão "Gerenciar"
    manageButton?.addEventListener('click', () => {
        manageSection.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede rolagem da página
    });

    // Listener para o overlay (fecha ao clicar fora)
    overlay?.addEventListener('click', () => {
        closeManageSection();
    });

    // Listener para o botão "Aceitar" no banner principal
    acceptButton?.addEventListener('click', () => {
        hideBanner();
    });

    // Listener para "Aceitar Todos" na seção de gerenciamento
    acceptAllInManage?.addEventListener('click', () => {
        // Marcar todos os toggles
        document.querySelectorAll('.toggle-switch input:not([disabled])')
            .forEach(toggle => toggle.checked = true);
        
        setTimeout(() => {
            closeManageSection();
            hideBanner();
        }, 300);
    });

    // Listener para "Recusar Todos" na seção de gerenciamento
    rejectAllInManage?.addEventListener('click', () => {
        // Desmarcar todos os toggles (exceto os desabilitados)
        document.querySelectorAll('.toggle-switch input:not([disabled])')
            .forEach(toggle => toggle.checked = false);
        
        setTimeout(() => {
            closeManageSection();
            hideBanner();
        }, 300);
    });
}

function closeManageSection() {
    const manageSection = document.querySelector('.manage-options');
    const overlay = document.querySelector('.consent-overlay');
    
    manageSection.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = ''; // Restaura rolagem da página
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
