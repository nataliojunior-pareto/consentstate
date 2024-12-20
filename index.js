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

function checkConsent() {
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

acceptAllButton.addEventListener('click', () => {
    updateConsent(consentOptions.reduce((obj, key) => ({ ...obj, [key]: 'granted' }), {}));
});

rejectAllButton.addEventListener('click', () => {
    updateConsent(consentOptions.reduce((obj, key) => ({ ...obj, [key]: 'denied' }), {}));
});


manageButton.addEventListener('click', () => {
  manageOptions.style.display = 'block';

    // Cria os checkboxes dinamicamente se ainda não existirem
    if (consentOptionsContainer.children.length === 0) {
        consentOptions.forEach(option => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option;
            checkbox.name = option;
            const label = document.createElement('label');
            label.htmlFor = option;
            label.textContent = option.replace(/_/g, ' '); // Substitui _ por espaço

            // Verifica o estado atual do consentimento para marcar/desmarcar o checkbox.
            gtag('get', 'consent_state', (consentState) => {
                checkbox.checked = consentState[option] === 'granted';
            });

            div.appendChild(checkbox);
            div.appendChild(label);
            consentOptionsContainer.appendChild(div);
        });
    }
});


saveManageButton.addEventListener('click', () => {
  const consentObject = {};
  consentOptions.forEach(option => {
    const checkbox = document.getElementById(option);
    consentObject[option] = checkbox.checked ? 'granted' : 'denied';
  });
  updateConsent(consentObject);
  manageOptions.style.display = 'none';
});

cancelManageButton.addEventListener('click', () => {
  manageOptions.style.display = 'none';
});

// Chama a função checkConsent() ao carregar a página
window.addEventListener('DOMContentLoaded', checkConsent);

// Estilo inline para o gerenciamento de opções (pode ser movido para um arquivo CSS)
const style = document.createElement('style');
style.textContent = `
  .manage-options {
    display: none;
    border: 1px solid #ccc;
    padding: 20px;
    margin-top: 10px;
    position: relative; /* Para posicionar o botão de fechar */
  }
  .consent-options-container {
      display: flex;
      flex-direction: column;
  }
  .consent-options-container div {
      margin-bottom: 5px; /* Espaçamento entre as opções */
  }
`;
document.head.appendChild(style);
