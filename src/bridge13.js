const consentOptions = [
  'ad_storage',
  'analytics_storage',
  'ad_user_data',
  'ad_personalization',
  'personalization_storage',
  'functionality_storage',
  'security_storage',
];

// Mapeamento dos tipos de consentimento com suas respectivas opções
const consentMapping = {
    'medicao': ['ad_storage', 'ad_user_data'],
    'marketing': ['analytics_storage'],
    'experiencia': ['ad_personalization', 'personalization_storage'],
    'funcionalidade': ['functionality_storage', 'security_storage']
};

// Função para gerar objeto de consentimento baseado nas escolhas
function generateConsentObject(choices) {
    const consentObject = {};
    
    // Inicializa todas as opções como 'denied'
    consentOptions.forEach(option => {
        consentObject[option] = 'denied';
    });

    // Atualiza as opções baseado nas escolhas
    Object.entries(choices).forEach(([type, isGranted]) => {
        if (consentMapping[type]) {
            consentMapping[type].forEach(option => {
                consentObject[option] = isGranted ? 'granted' : 'denied';
            });
        }
    });

    return consentObject;
}

// Funções para os diferentes cenários de consentimento
export function acceptAllConsents() {
    const consentObject = {};
    consentOptions.forEach(option => {
        consentObject[option] = 'granted';
    });
    updateConsent(consentObject);
}

export function rejectAllConsents() {
    const consentObject = {};
    consentOptions.forEach(option => {
        consentObject[option] = 'denied';
    });
    updateConsent(consentObject);
}

export function updateManagedConsents() {
    const choices = getToggleStates();
    const consentObject = generateConsentObject(choices);
    updateConsent(consentObject);
}

// Função para coletar estado atual dos toggles
function getToggleStates() {
    const choices = {
        'medicao': document.querySelector('[data-consent-type="medicao"] input').checked,
        'marketing': document.querySelector('[data-consent-type="marketing"] input').checked,
        'experiencia': document.querySelector('[data-consent-type="experiencia"] input').checked,
        'funcionalidade': document.querySelector('[data-consent-type="funcionalidade"] input').checked
    };
    return choices;
}

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

export function createBanner(urlBanner) {
    // Criar uma variável para o container no escopo da função
    let bannerContainer = document.createElement('div');

    return fetch(urlBanner)
        .then(response => response.text())
        .then(html => {
            // Inserir o HTML no container
            bannerContainer.innerHTML = html;

            // Extrair os elementos
            const styleElement = bannerContainer.querySelector('style');
            const bannerElement = bannerContainer.querySelector('.cookie-banner');
            const manageSection = bannerContainer.querySelector('.manage-options');
            const overlay = bannerContainer.querySelector('.consent-overlay');
            const settingButton = bannerContainer.querySelector('.cookie-settings-button')

            // Adicionar o CSS se existir
            if (styleElement) {
                document.head.appendChild(styleElement.cloneNode(true));
            }
            document.body.appendChild(bannerElement);
            document.body.appendChild(manageSection);
            document.body.appendChild(overlay);
            document.body.appendChild(settingButton);
        })
        .catch(error => {
            console.error('Erro ao criar banner:', error);
        });
}

function checkConsent() {
    console.log('default');
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

export function start() {
  defaultConsent();
  window.addEventListener('DOMContentLoaded', checkConsent);
}
