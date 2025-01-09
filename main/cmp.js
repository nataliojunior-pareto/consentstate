const consentBanner = document.getElementById('consent-banner');
const acceptAllButton = document.getElementById('accept-all');
const rejectAllButton = document.getElementById('reject-all');
const manageButton = document.getElementById('manage');
const manageOptions = document.querySelector('.manage-options');
const saveManageButton = document.getElementById('save-manage');
const cancelManageButton = document.getElementById('cancel-manage');
const consentOptionsContainer = document.querySelector('.consent-options-container');

const consentOptions = [
  'ad_storage',
  'analytics_storage',
  'ad_user_data',
  'ad_personalization',
  'personalization_storage',
  'functionality_storage',
  'security_storage',
];

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const encodedValue = parts.pop().split(';').shift();
    // Decodifica a string antes de retornar:
    return decodeURIComponent(encodedValue);
  }
  return null;
}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  let cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;

    // Define SameSite=None; Secure para todos os cookies, exceto em localhost para desenvolvimento
    if (window.location.hostname !== "localhost") {
        cookie += "; SameSite=None; Secure";
    }

  document.cookie = cookie;
}

function updateConsent(consentObject) {
    //gtag('consent', 'update', consentObject);
    setCookie('pareto_consent_state', consentObject, 90);
    consentBanner.style.display = 'none';
    setTimeout(() => {
      dataLayer.push({
      'consent_state': consentObject,
      'event': 'update_consent'
      });
    }, 1000);
}

function defaultConsent() {
  // Inicialização dataLayer e configurações iniciais
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'personalization_storage': 'denied',
      'functionality_storage': 'denied',
      'security_storage': 'denied',
      'wait_for_update': 500,
      'region': ['BR']
    });
}

function createBanner() {
  // 1. Cria a estrutura do banner
  const banner = document.createElement('div');
  banner.id = 'consent-banner';
  banner.innerHTML = `
    <p>Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa <a href="/politica-de-privacidade">política de privacidade</a>.</p>
    <div class="consent-buttons">
      <button id="reject-all">Rejeitar tudo</button>
      <button id="accept-all">Aceitar todos os cookies</button>
      <button id="manage">Gerenciar</button>
    </div>
    <div class="manage-options" style="display:none;">
      <h2>Preferências de coleta de dados do site</h2>
      <div class="consent-options-container"></div>
      <div class="consent-buttons">
        <button id="cancel-manage">Cancelar</button>
        <button id="save-manage">Salvar</button>
      </div>
    </div>
  `;

  // 2. Adiciona o banner ao body
  document.body.appendChild(banner);

  // 3. Adiciona os event listeners para os botões
  const rejectAllButton = document.getElementById('reject-all');
  const acceptAllButton = document.getElementById('accept-all');
  const manageButton = document.getElementById('manage');
  const manageOptions = banner.querySelector('.manage-options');
  const cancelManageButton = document.getElementById('cancel-manage');
  const saveManageButton = document.getElementById('save-manage');


  rejectAllButton.addEventListener('click', () => {
    // Lógica para rejeitar todos os cookies
    console.log("Rejeitar todos os cookies");
    // Aqui você adicionaria a lógica para remover os cookies
    banner.remove(); // remove o banner após a ação.
  });

  acceptAllButton.addEventListener('click', () => {
    // Lógica para aceitar todos os cookies
    console.log("Aceitar todos os cookies");
    // Aqui você adicionaria a lógica para definir os cookies
    banner.remove(); // remove o banner após a ação.
  });

  manageButton.addEventListener('click', () => {
    manageOptions.style.display = 'block'; // Mostra as opções de gerenciamento
  });

  cancelManageButton.addEventListener('click', () => {
    manageOptions.style.display = 'none'; // Esconde as opções de gerenciamento
  });

  saveManageButton.addEventListener('click', () => {
    // Lógica para salvar as preferências de cookies
    console.log("Salvar preferências");
    // Aqui você adicionaria a lógica para salvar as preferências e definir os cookies
    manageOptions.style.display = 'none'; // Esconde as opções de gerenciamento
    banner.remove(); // remove o banner após a ação.
  });


  return banner;
}

// Chama a função para criar o banner.
createBanner();

function hideBanner() {
    return null
}

function autoBlocking() {
    const consentStateString = getCookie('pareto_consent_state');
    if (consentStateString) {
        consentBanner.style.display = 'none';
        const consentState = JSON.parse(consentStateString);
        updateConsent(consentState)
    } else {
        // Consentimento não dado, mostra o banner
        consentBanner.style.display = 'flex';
    }
}

function start() {
  defaultConsent();
  createBanner();
  window.addEventListener('DOMContentLoaded', checkConsent);
}
