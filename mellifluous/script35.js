const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template21.html';

import { createBanner, start, acceptAllConsents, rejectAllConsents, updateManagedConsents, autoBlocking} from 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/bridge16.js';

async function initializeCMP() {
    try {
        await start();
        await createBanner(url);
        await autoBlocking();
        initializeBannerListeners();
    } catch (error) {
        console.error('Erro ao inicializar CMP:', error);
    }
}

function initializeBannerListeners() {
    const manageButton = document.getElementById('manage');
    const acceptButton = document.getElementById('accept-all');
    const manageSection = document.querySelector('.manage-options');
    const overlay = document.querySelector('.consent-overlay');
    const acceptAllInManage = document.querySelector('.btn-accept-all');
    const rejectAllInManage = document.querySelector('.btn-reject-all');
    const settingsButton = document.querySelector('.cookie-settings-button');
    const saveChangesButton = document.querySelector('.btn-save-changes');
    
    settingsButton?.addEventListener('click', () => {
        showBanner();
    });

    manageButton?.addEventListener('click', () => {
        manageSection.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    overlay?.addEventListener('click', () => {
        closeManageSection();
    });

    acceptButton?.addEventListener('click', () => {
        acceptAllConsents();
        hideBanner();
    });

    acceptAllInManage?.addEventListener('click', () => {
        // Marcar todos os toggles visualmente
        document.querySelectorAll('.toggle-switch input:not([disabled])')
            .forEach(toggle => toggle.checked = true);
        
        acceptAllConsents();
        setTimeout(() => {
            closeManageSection();
            hideBanner();
        }, 300);
    });

    rejectAllInManage?.addEventListener('click', () => {
        // Desmarcar todos os toggles visualmente
        document.querySelectorAll('.toggle-switch input:not([disabled])')
            .forEach(toggle => toggle.checked = false);
        
        rejectAllConsents();
        setTimeout(() => {
            closeManageSection();
            hideBanner();
        }, 300);
    });

    saveChangesButton?.addEventListener('click', () => {
        updateManagedConsents();
        closeManageSection();
        hideBanner();
    });

    settingsButton?.addEventListener('click', () => {
        showBanner();
    });
}

function closeManageSection() {
    const manageSection = document.querySelector('.manage-options');
    const overlay = document.querySelector('.consent-overlay');
    
    if (manageSection) manageSection.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function hideBanner() {
    const banner = document.querySelector('.cookie-banner');
    const settingsButton = document.querySelector('.cookie-settings-button');
    
    if (!banner) return;

    banner.classList.add('hidden');
    if (settingsButton) {
        settingsButton.style.display = 'flex';
    }
}

function showBanner() {
    const banner = document.querySelector('.cookie-banner');
    const settingsButton = document.querySelector('.cookie-settings-button');
    
    if (banner) {
        banner.classList.remove('hidden');
    }
    
    if (settingsButton) {
        settingsButton.style.display = 'none';
    }
}

initializeCMP();
