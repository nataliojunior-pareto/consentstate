const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template.html';
async function loadCMP() {
    try {
        const module = await import('//cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/cmp4.js');
        console.log('Módulo carregado com sucesso');
        createBanner(url);
        return module;
    } catch (error) {
        console.error('Erro ao carregar o módulo:', error);
    }
}

loadCMP();
