function verMais() {
    // Seleciona o elemento com a classe 'container_ver_mais'
    var container = document.querySelector('.container_ver_mais');
    
    // Altera o estilo display para 'flex'
    container.style.display = 'flex';
}

function fecharVerMais(){
    // Seleciona o elemento com a classe 'container_ver_mais'
    var container = document.querySelector('.container_ver_mais');
    
    // Altera o estilo display para 'flex'
    container.style.display = 'none';
}

function fecharNotificacao(){
    var container = document.querySelector('.container_interesse');

    container.style.display = 'none';
}

function tenhoInteresse(){
    fecharVerMais();
    var container = document.querySelector('.container_interesse');
    
    container.style.display = 'flex';
}