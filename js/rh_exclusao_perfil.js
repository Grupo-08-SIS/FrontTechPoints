async function excluirParcialmente() {
    const data = JSON.parse(sessionStorage.getItem('user'));

    if (!data || !data.email || !data.senha) {
        alert('Informações de usuário não encontradas.');
        return;
    }

    const email = data.email;
    const senha = data.senha;

    console.log(email, senha);

    try {
        const response = await fetch('http://localhost:8080/usuarios/deletar', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const responseText = await response.text(); // Captura o texto da resposta

        if (response.ok) {
            // Se a resposta for OK, verifica o conteúdo
            console.log('Resposta do servidor:', responseText);
            window.location.href = '/html/home.html';
        } else {
            // Se a resposta não for OK, lança erro
            console.error('Erro no servidor:', responseText);
            throw new Error('Erro ao tentar excluir a conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar excluir a conta');
    }
}



function fecharNotificacao(){
    var container = document.querySelector('.container_notificacao_exclusao');

    container.style.display = 'none';
}

function abrirNotificacaoParcial() {
    var container = document.querySelector('.container_notificacao_exclusao');
    container.style.display = 'flex';

    var linkElement = container.querySelector('a');
    linkElement.textContent = 'parcialmente';
    linkElement.style.color = 'red';

    var botaoConfirmar = document.getElementById('confirmarExclusao');
    botaoConfirmar.onclick = excluirParcialmente;
}

function abrirNotificacaoPermanente(){
    var container = document.querySelector('.container_notificacao_exclusao');
    container.style.display = 'flex';

    var linkElement = container.querySelector('a');
    linkElement.textContent = 'permanentemente';
    linkElement.style.color = 'red';

    var botaoConfirmar = document.getElementById('confirmarExclusao');
    botaoConfirmar.onclick = excluirPermanentemente;
}

async function excluirPermanentemente() {
    const data = JSON.parse(sessionStorage.getItem('user'));

    if (!data || !data.email || !data.senha) {
        alert('Informações de usuário não encontradas.');
        return;
    }

    const email = data.email;
    const senha = data.senha;

    console.log(email, senha);

    try {
        const response = await fetch('http://localhost:8080/usuarios/deletar', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const responseText = await response.text(); // Captura o texto da resposta

        if (response.ok) {
            // Se a resposta for OK, verifica o conteúdo
            console.log('Resposta do servidor:', responseText);
            window.location.href = '/html/home.html';
        } else {
            // Se a resposta não for OK, lança erro
            console.error('Erro no servidor:', responseText);
            throw new Error('Erro ao tentar excluir a conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar excluir a conta');
    }
}