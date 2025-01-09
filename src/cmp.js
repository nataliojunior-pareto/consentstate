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

function createBanner(theme = 'branco', font = 'DM Sans Normal', position = 'central') {
    // Criar o elemento principal do banner
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';

    // Definir o conteúdo HTML
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

    // Aplicar estilos base
    banner.style.padding = '20px';
    banner.style.maxWidth = '400px';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    banner.style.fontFamily = font === 'DM Sans Normal' ? 'DM Sans, sans-serif' : 'Ubuntu, sans-serif';

    // Aplicar tema
    if (theme === 'branco') {
        banner.style.backgroundColor = '#ffffff';
        banner.style.color = '#000000';
    } else {
        banner.style.backgroundColor = '#333333';
        banner.style.color = '#ffffff';
    }

    // Aplicar posição
    banner.style.position = 'fixed';
    banner.style.margin = '20px';

    switch (position) {
        case 'canto superior esquerdo':
            banner.style.top = '0';
            banner.style.left = '0';
            break;
        case 'canto superior direito':
            banner.style.top = '0';
            banner.style.right = '0';
            break;
        case 'canto inferior esquerdo':
            banner.style.bottom = '0';
            banner.style.left = '0';
            break;
        case 'canto inferior direito':
            banner.style.bottom = '0';
            banner.style.right = '0';
            break;
        case 'preso no topo':
            banner.style.top = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.margin = '0';
            banner.style.maxWidth = '100%';
            break;
        case 'flutuando no topo':
            banner.style.top = '20px';
            banner.style.left = '50%';
            banner.style.transform = 'translateX(-50%)';
            break;
        case 'preso embaixo':
            banner.style.bottom = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.margin = '0';
            banner.style.maxWidth = '100%';
            break;
        case 'flutuando embaixo':
            banner.style.bottom = '20px';
            banner.style.left = '50%';
            banner.style.transform = 'translateX(-50%)';
            break;
        case 'central':
            banner.style.top = '50%';
            banner.style.left = '50%';
            banner.style.transform = 'translate(-50%, -50%)';
            break;
    }

    // Estilos adicionais para botões
    const style = document.createElement('style');
    style.textContent = `
        #cookie-banner button {
            padding: 8px 16px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: ${theme === 'branco' ? '#007bff' : '#ffffff'};
            color: ${theme === 'branco' ? '#ffffff' : '#333333'};
        }
        #cookie-banner .consent-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 15px;
        }
        #cookie-banner a {
            color: ${theme === 'branco' ? '#007bff' : '#ffffff'};
        }
    `;

    // Adicionar o banner e os estilos ao documento
    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Adicionar funcionalidade aos botões
    document.getElementById('accept-all').addEventListener('click', () => {
        banner.remove();
        // Adicionar lógica para aceitar cookies
    });

    document.getElementById('reject-all').addEventListener('click', () => {
        banner.remove();
        // Adicionar lógica para rejeitar cookies
    });

    document.getElementById('manage').addEventListener('click', () => {
        const manageOptions = banner.querySelector('.manage-options');
        manageOptions.style.display = manageOptions.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('cancel-manage').addEventListener('click', () => {
        banner.querySelector('.manage-options').style.display = 'none';
    });

    document.getElementById('save-manage').addEventListener('click', () => {
        banner.remove();
        // Adicionar lógica para salvar preferências
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
  window.addEventListener('DOMContentLoaded', checkConsent);
}
