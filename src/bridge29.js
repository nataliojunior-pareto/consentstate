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
    'anuncios': ['ad_storage', 'ad_user_data', 'ad_personalization'],
    'analise': ['analytics_storage'],
    'personalizacao': ['personalization_storage'],
    'funcionalidade': ['functionality_storage', 'security_storage']
};

function updateTogglesFromSavedState(consentState) {
    // Reverte o mapeamento para encontrar quais tipos devem estar marcados
    const toggleStates = {
        anuncios: consentState.ad_storage === 'granted' && consentState.ad_user_data === 'granted' && consentState.ad_personalization === 'granted',
        analise: consentState.analytics_storage === 'granted',
        personalizacao: consentState.personalization_storage === 'granted',
        funcionalidade: consentState.functionality_storage === 'granted' && consentState.security_storage === 'granted'
    };

    // Atualiza cada toggle
    Object.entries(toggleStates).forEach(([type, isGranted]) => {
        const toggle = document.querySelector(`[data-consent-type="${type}"] input`);
        if (toggle) {
            toggle.checked = isGranted;
        }
    });
}

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
        'anuncios': document.querySelector('[data-consent-type="anuncios"]').checked,
        'analise': document.querySelector('[data-consent-type="analise"]').checked,
        'personalizacao': document.querySelector('[data-consent-type="personalizacao"]').checked,
        'funcionalidade': document.querySelector('[data-consent-type="funcionalidade"]').checked
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
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'update', consentObject);
    setCookie('pareto_consent_state', consentObject, 90);
    setTimeout(() => {
      dataLayer.push({
      'consent_state': consentObject,
      'event': 'update_consent'
      });
    }, 1000);
}

export function defaultConsent() {
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
    return fetch(urlBanner)
        .then(response => response.text())
        .then(html => {
            const bannerContainer = document.createElement('div');
            bannerContainer.innerHTML = html;

            // Extrair os elementos
            const styleElement = bannerContainer.querySelector('style');
            const bannerElement = bannerContainer.querySelector('.cookiee-banner');
            const manageSection = bannerContainer.querySelector('.manage-options');
            const overlay = bannerContainer.querySelector('.consent-overlay');
            const settingButton = bannerContainer.querySelector('.cookie-settings-button');

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

export async function autoBlocking() {
    const consentStateString = getCookie('pareto_consent_state');
    const banner = document.querySelector('.cookiee-banner');
    const settingsButton = document.querySelector('.cookie-settings-button');
    const acceptButton = document.querySelector('.accept-button');

    if (consentStateString) {
        try {
            const consentState = JSON.parse(consentStateString);
            banner.classList.add('hidden');
            settingsButton.style.display = 'flex'; // Mostra o botão flutuante
            acceptButton.style.display = 'none';
            updateConsent(consentState);
            
            // Atualiza os toggles conforme o estado salvo
            updateTogglesFromSavedState(consentState);
        } catch (error) {
            console.error('Erro ao processar estado do consentimento:', error);
            banner.classList.remove('hidden');
            settingsButton.style.display = 'none';
        }
    } else {
        banner.classList.remove('hidden');
        settingsButton.style.display = 'none';
    }
}

export function start() {
  defaultConsent();
  window.addEventListener('DOMContentLoaded', checkConsent);
}
