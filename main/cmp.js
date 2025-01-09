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
  // 1. Busca o HTML do banner de um arquivo externo
  fetch('../mellifluous/banner.html') // Substitua 'banner.html' pelo nome do seu arquivo
    .then(response => response.text())
    .then(html => {
      // 2. Cria um elemento div e define o HTML do banner
      const banner = document.createElement('div');
      banner.innerHTML = html;

      // 3. Adiciona o banner ao body
      document.body.appendChild(banner);

      // 4. Event Listeners (mesmo código do exemplo anterior)
      const rejectAllButton = document.getElementById('reject-all');
      const acceptAllButton = document.getElementById('accept-all');
      const manageButton = document.getElementById('manage');
      const manageOptions = banner.querySelector('.manage-options');
      const cancelManageButton = document.getElementById('cancel-manage');
      const saveManageButton = document.getElementById('save-manage');

      rejectAllButton.addEventListener('click', () => {
        console.log("Rejeitar todos os cookies");
        banner.remove();
      });

      acceptAllButton.addEventListener('click', () => {
        console.log("Aceitar todos os cookies");
        banner.remove();
      });

      manageButton.addEventListener('click', () => {
        manageOptions.style.display = 'block';
      });

      cancelManageButton.addEventListener('click', () => {
        manageOptions.style.display = 'none';
      });

      saveManageButton.addEventListener('click', () => {
        console.log("Salvar preferências");
        manageOptions.style.display = 'none';
        banner.remove();
      });
    })
    .catch(error => {
      console.error("Erro ao carregar o banner:", error);
      // Lógica para lidar com o erro, por exemplo, exibir uma mensagem de erro
    });
}

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
