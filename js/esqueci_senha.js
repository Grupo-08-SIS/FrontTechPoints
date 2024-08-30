function mostrarCampoCodigo() {
     // Esconde o parágrafo e o campo de e-mail
     document.querySelector('p').style.display = 'none'; // Seleciona o parágrafo de instrução
     document.getElementById('emailInput').style.display = 'none';

    const botaoProximo = document.querySelector('.bloco-principal button');
    botaoProximo.style.display = 'none';

    const campoCodigo = document.getElementById('campoCodigo');
    campoCodigo.style.display = 'block';
}

function mostrarCamposSenha() {
    const campoCodigo = document.getElementById('campoCodigo');
    campoCodigo.style.display = 'none';

    // Mostra os campos de nova senha e confirmação de senha
    const campoSenha = document.getElementById('campoSenha');
    campoSenha.style.display = 'block';
}

function finalizarRecuperacao() {
    alert('Sua senha foi alterada com sucesso!');
    setTimeout
}