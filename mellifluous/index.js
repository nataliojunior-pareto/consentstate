const url = 'https://cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/mellifluous/banner-template.html';
import('//cdn.jsdelivr.net/gh/nataliojunior-pareto/consentstate@main/src/cmp4.js')
    .then(module => {
        // Use as funções do módulo aqui
        console.log('Módulo carregado com sucesso');
        createBanner(url);
    })
    .catch(error => console.error('Erro ao carregar o módulo:', error));
