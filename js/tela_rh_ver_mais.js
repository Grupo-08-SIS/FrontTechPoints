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

async function fazerLogout() {
    const user = JSON.parse(sessionStorage.getItem('user'))

    try {
    
        const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.idUsuario}`, {
            method: 'POST'
        })

      
        if (!response.ok) {
            throw new Error('Erro ao fazer logoff')
        }

        sessionStorage.clear()

        window.location.href = '/html/home.html'

    } catch (error) {
        console.error('Erro ao fazer logoff:', error)
        alert('Erro ao fazer logoff. Por favor, tente novamente.')
    }
} 