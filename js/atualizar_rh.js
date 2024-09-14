async function salvarMudancas(event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Obtém os valores do formulário
    const novoPrimeiroNome = document.getElementById('novo_apelido').value;
    const novoSobrenome = document.getElementById('novo_sobrenome').value;
    const telefone = document.getElementById('novo_telefone').value;
    const email = document.getElementById('email').value;
    const novaSenha = document.getElementById('nova_senha').value;
    const confirmacaoSenha = document.getElementById('nova_senha_confirmacao').value;

    // Verifica se as senhas coincidem
    if (novaSenha && novaSenha !== confirmacaoSenha) {
        alert('As senhas não coincidem.');
        return;
    }

    // Construa o objeto de dados
    const dados = {};

    // Atualiza o nome de usuário com base nas mudanças
    dados.nomeUsuario = `${novoPrimeiroNome || dadosUsuarioAtual.primeiroNome} ${novoSobrenome || dadosUsuarioAtual.sobrenome}`.trim();

    if (novoPrimeiroNome) dados.primeiroNome = novoPrimeiroNome;
    if (novoSobrenome) dados.sobrenome = novoSobrenome;
    if (telefone) dados.telefone = telefone;
    if (email) dados.email = email;
    if (novaSenha) dados.senha = novaSenha;

    // Substitua `{id}` pelo ID real do usuário
    const userId = 3; // Substitua pelo ID do usuário
    const endpoint = `http://localhost:8080/usuarios/atualizar/${userId}`;

    try {
        // Envia a requisição PATCH para o endpoint
        const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        if (response.ok) {
            // Atualização bem-sucedida
            showAlert('Informações atualizadas com sucesso! Você será redirecionado para a tela de login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html'; // Redireciona para a página de login
            }, 3000); // Aguarda 3 segundos antes de redirecionar
        } else {
            // Se a resposta não for OK, exibe uma mensagem de erro
            const error = await response.json();
            showAlert(`Erro: ${error.message || 'Não foi possível atualizar as informações.'}`, 'error');
        }
    } catch (error) {
        // Lida com erros de rede ou outros erros
        showAlert(`Erro: ${error.message}`, 'error');
    }
}


function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alerta');
    const alertTitle = alertBox.querySelector('.titulo_alerta');
    const alertText = alertBox.querySelector('.texto_alerta');

    // Define o título e o texto do alerta
    alertTitle.textContent = type === 'success' ? 'Sucesso' : 'Erro';
    alertText.textContent = message;

    // Define a classe para o tipo de alerta
    alertBox.className = `container_alerta show ${type}`;
    alertBox.style.display = 'block';

    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.style.opacity = '1';
        }, 500);
    }, 3000);
}

async function fazerLogout() {
    const user = JSON.parse(sessionStorage.getItem('user'))

    try {
    
        const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.id}`, {
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

document.addEventListener("DOMContentLoaded", async function () {
    // Recupera o item 'user' do sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id) {
        console.error('ID do usuário não encontrado no sessionStorage.');
        return;
    }

    const idUsuario = user.id;

    // Função para listar favoritos
    async function listarFavoritos() {
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/favoritos`);
            const data = await response.json();

            const container = document.querySelector(".bloco_alunos_favoritos");
            container.innerHTML = ""; // Limpa o conteúdo existente

            if (data.length === 0) {
                const noFavoritesMessage = document.createElement("p");
                noFavoritesMessage.textContent = "Não há alunos favoritos no momento.";
                noFavoritesMessage.className = "no-alunos-message";
                container.appendChild(noFavoritesMessage);
            } else {
                data.forEach(aluno => {
                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno_favoritos";
                    
                    alunoDiv.innerHTML = `
                        <span>${aluno.nomeUsuario}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${aluno.nomeCurso}</a> com</span>
                        <img src="../imgs/gold medal.png" alt="medalha">
                        <button onclick="desfavoritar(${aluno.id})">Desfavoritar</button>
                    `;
                    
                    container.appendChild(alunoDiv);
                });
            }
        } catch (error) {
            console.error("Erro ao buscar alunos favoritos:", error);
        }
    }

    // Função para listar interessados
    async function listarInteressados() {
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/interessados`);
            const data = await response.json();

            const container = document.querySelector(".bloco_alunos");
            container.innerHTML = ""; // Limpa o conteúdo existente

            if (data.length === 0) {
                const noInterestedMessage = document.createElement("p");
                noInterestedMessage.textContent = "Não há alunos interessados no momento.";
                noInterestedMessage.className = "no-alunos-message";
                container.appendChild(noInterestedMessage);
            } else {
                data.forEach(aluno => {
                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno";
                    
                    alunoDiv.innerHTML = `
                        <span>${aluno.nomeUsuario}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${aluno.nomeCurso}</a> com</span>
                        <img src="../imgs/gold medal.png" alt="medalha">
                    `;
                    
                    container.appendChild(alunoDiv);
                });
            }
        } catch (error) {
            console.error("Erro ao buscar interessados:", error);
        }
    }

    window.desfavoritar = async function(idAluno) {
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/favoritos/${idAluno}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log(`Aluno com ID ${idAluno} desfavoritado.`);
                listarFavoritos(); // Atualiza a lista de favoritos
            } else {
                console.error('Erro ao desfavoritar o aluno.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // Função para formatar a data
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', options);
    }

    // Chama as funções para listar favoritos e interessados
    listarFavoritos();
    listarInteressados();
});

document.addEventListener("DOMContentLoaded", async function () {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
        document.getElementById('id_nome').innerText = `${user.primeiroNome} ${user.sobrenome}` || 'Nome não disponível';
        document.getElementById('id_email_usuario').innerText = user.email || 'Email não disponível';
        document.getElementById('span_data_criacao').innerText = user.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString() : 'Data não disponível';
        document.getElementById('span_data_ultima_atualizacao').innerText = user.dataAtualizacao ? new Date(user.dataAtualizacao).toLocaleDateString() : 'Não houve nenhuma atualização';
        document.getElementById('span_empresa').innerText = user.empresa.nome || 'Nome da empresa não disponível';
        document.getElementById('span_setor').innerText = user.empresa.setorIndustria || 'Setor não disponível';
        document.getElementById('span_cargo').innerText = user.cargoUsuario || 'Email não disponível';
        document.getElementById('span_email_empresa').innerText = user.empresa.emailCorporativo || 'Email não disponível';

    } else {
        document.getElementById('id_nome').innerText = 'Nome não disponível';
        document.getElementById('id_email_usuario').innerText = 'Email não disponível';
        document.getElementById('span_data_criacao').innerText = 'Data não disponível';
        document.getElementById('span_data_ultima_atualizacao').innerText = 'Não houve nenhuma atualização';
    }
});

function editarPerfil() {
    document.querySelector('.container_fundo_editar_informacoes').style.display = 'flex';
}

function fecharFormulario() {
    document.querySelector('.container_fundo_editar_informacoes').style.display = 'none';
}