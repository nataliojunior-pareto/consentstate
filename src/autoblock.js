// AINDA NÃO FUNCIONAL

// 1. Configurações Globais
const CONFIG = {
    block: {
        inline: true,
        unknown: false,
        sync: true,
        img: false,
        samedomain: false,
        link: false
    },
    ignoreDomains: [
        "cdn.jsdelivr.net"
    ]
};

// 2. Classe Principal de Bloqueio
class CookieBlocker {
    constructor(options) {
        this.options = options;
        this.blockingMode = options.mode || 'cm';
        this.initialized = false;
        this.blockedElements = new Set();
        this.observers = [];
        this.consentStatus = {
            analytics: false,
            advertising: false,
            functional: false
        };
    }

    init() {
        this.setupBlocker();
        this.initializeObservers();
        this.handleDOMContent();
        this.initialized = true;
    }

    setupBlocker() {
        this.setupBlockingRules();
        this.setupConsentHandling();
    }

    setupBlockingRules() {
        this.blockingRules = {
            scripts: this.options.block.inline,
            images: this.options.block.img,
            iframes: true,
            thirdParty: !this.options.block.samedomain
        };
    }

    setupConsentHandling() {
        if (typeof window.__tcfapi !== 'undefined') {
            window.__tcfapi('addEventListener', 2, (tcData, success) => {
                if (success && tcData.eventStatus === 'tcloaded') {
                    this.handleTCFConsent(tcData);
                }
            });
        }
    }

    initializeObservers() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.handleDOMMutation(mutation);
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href']
        });

        this.observers.push(observer);
    }

    handleDOMMutation(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    this.checkAndBlockElement(node);
                }
            });
        } else if (mutation.type === 'attributes') {
            this.checkAndBlockElement(mutation.target);
        }
    }

    checkAndBlockElement(element) {
        if (this.shouldBlockElement(element)) {
            this.blockElement(element);
        }
    }

    shouldBlockElement(element) {
        if (!element || !element.tagName) return false;

        const tagName = element.tagName.toLowerCase();
        const src = element.src || element.href;

        // Verifica se é um elemento que deve ser bloqueado
        if (!this.blockingRules[tagName]) {
            return false;
        }

        // Verifica se é um domínio ignorado
        if (src && this.isDomainIgnored(src)) {
            return false;
        }

        // Verifica se é conteúdo de terceiros
        if (this.blockingRules.thirdParty && src) {
            return this.isThirdPartyContent(src);
        }

        return true;
    }

    isDomainIgnored(url) {
        try {
            const domain = new URL(url).hostname;
            return this.options.ignoreDomains.some(ignoredDomain => 
                domain.includes(ignoredDomain)
            );
        } catch (e) {
            return false;
        }
    }

    isThirdPartyContent(url) {
        try {
            const domain = new URL(url).hostname;
            return domain !== window.location.hostname;
        } catch (e) {
            return true;
        }
    }

    blockElement(element) {
        if (this.blockedElements.has(element)) {
            return;
        }

        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'script':
                this.handleScript(element);
                break;
            case 'iframe':
                this.handleIframe(element);
                break;
            case 'img':
                this.handleImage(element);
                break;
            default:
                this.handleGenericElement(element);
        }

        this.blockedElements.add(element);
        this.triggerBlockEvent(element);
    }

    handleScript(script) {
        const placeholder = document.createElement('script');
        placeholder.type = 'text/plain';
        placeholder.dataset.originalType = 'text/javascript';
        placeholder.dataset.src = script.src;
        placeholder.dataset.blocked = 'true';
        
        if (script.innerText) {
            placeholder.innerText = script.innerText;
        }
        
        script.parentNode.replaceChild(placeholder, script);
    }

    handleIframe(iframe) {
        iframe.dataset.originalSrc = iframe.src;
        iframe.src = 'about:blank';
        iframe.dataset.blocked = 'true';
    }

    handleImage(img) {
        img.dataset.originalSrc = img.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        img.dataset.blocked = 'true';
    }

    handleGenericElement(element) {
        element.dataset.blocked = 'true';
    }

    handleTCFConsent(tcData) {
        if (tcData.purpose && tcData.purpose.consents) {
            this.updateConsentStatus(tcData.purpose.consents);
            this.updateBlockedElements();
        }
    }

    updateConsentStatus(consents) {
        this.consentStatus = {
            analytics: Boolean(consents[1]),
            advertising: Boolean(consents[3]),
            functional: Boolean(consents[2])
        };
        
        this.triggerConsentUpdate();
    }

    updateBlockedElements() {
        this.blockedElements.forEach(element => {
            const purpose = element.dataset.purpose;
            if (this.shouldUnblock(purpose)) {
                this.unblockElement(element);
            }
        });
    }

    shouldUnblock(purpose) {
        switch (purpose) {
            case 'analytics':
                return this.consentStatus.analytics;
            case 'advertising':
                return this.consentStatus.advertising;
            case 'functional':
                return this.consentStatus.functional;
            default:
                return false;
        }
    }

    unblockElement(element) {
        if (!element.dataset.blocked) return;

        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'script':
                this.unblockScript(element);
                break;
            case 'iframe':
                this.unblockIframe(element);
                break;
            case 'img':
                this.unblockImage(element);
                break;
            default:
                this.unblockGenericElement(element);
        }

        delete element.dataset.blocked;
        this.blockedElements.delete(element);
        this.triggerUnblockEvent(element);
    }

    unblockScript(script) {
        const newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        
        if (script.dataset.src) {
            newScript.src = script.dataset.src;
        }
        
        if (script.innerText) {
            newScript.innerText = script.innerText;
        }
        
        script.parentNode.replaceChild(newScript, script);
    }

    unblockIframe(iframe) {
        if (iframe.dataset.originalSrc) {
            iframe.src = iframe.dataset.originalSrc;
            delete iframe.dataset.originalSrc;
        }
    }

    unblockImage(img) {
        if (img.dataset.originalSrc) {
            img.src = img.dataset.originalSrc;
            delete img.dataset.originalSrc;
        }
    }

    unblockGenericElement(element) {
        // Remove quaisquer restrições aplicadas
        delete element.dataset.blocked;
    }

    triggerBlockEvent(element) {
        const event = new CustomEvent('elementBlocked', {
            detail: { element, type: element.tagName.toLowerCase() }
        });
        document.dispatchEvent(event);
    }

    triggerUnblockEvent(element) {
        const event = new CustomEvent('elementUnblocked', {
            detail: { element, type: element.tagName.toLowerCase() }
        });
        document.dispatchEvent(event);
    }

    triggerConsentUpdate() {
        const event = new CustomEvent('consentUpdated', {
            detail: { ...this.consentStatus }
        });
        document.dispatchEvent(event);
    }

    handleDOMContent() {
        document.querySelectorAll('script, iframe, img').forEach(element => {
            this.checkAndBlockElement(element);
        });
    }
}

// 3. Utilitários
const Utils = {
    isValidDomain(domain) {
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
        return domainRegex.test(domain);
    },

    checkConsent(vendorId) {
        return new Promise((resolve) => {
            if (typeof window.__tcfapi !== 'undefined') {
                window.__tcfapi('getVendorConsents', 2, (tcData, success) => {
                    resolve(success && tcData.vendorConsents?.[vendorId] || false);
                });
            } else {
                resolve(false);
            }
        });
    },

    parseURL(url) {
        try {
            const urlObject = new URL(url);
            return {
                protocol: urlObject.protocol,
                hostname: urlObject.hostname,
                pathname: urlObject.pathname,
                search: urlObject.search,
                hash: urlObject.hash
            };
        } catch (e) {
            return null;
        }
    }
};

// 4. Integração com Google
const GoogleIntegration = {
    setupConsentMode() {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500
        });
    },

    handleAnalytics(consent) {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('consent', 'update', {
            'ad_storage': consent.advertising ? 'granted' : 'denied',
            'analytics_storage': consent.analytics ? 'granted' : 'denied'
        });
    }
};

// 5. Inicialização
function initialize() {
    window._iub = window._iub || [];
    const blocker = new CookieBlocker({
        mode: "iubenda",
        options: CONFIG
    });
    
    // Configurar eventos
    document.addEventListener('consentUpdated', (event) => {
        GoogleIntegration.handleAnalytics(event.detail);
    });

    // Inicializar bloqueador
    blocker.init();
    
    // Configurar Google
    GoogleIntegration.setupConsentMode();

    // Retornar instância para uso externo
    return blocker;
}

// 6. Exportação Global
window.CookieBlocker = {
    init: initialize,
    utils: Utils,
    google: GoogleIntegration
};

// 7. Inicialização Automática
document.addEventListener('DOMContentLoaded', () => {
    window.CookieBlocker.init();
});
