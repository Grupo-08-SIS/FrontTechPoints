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
                for (const aluno of data) {
                    // Requisição para buscar todos os pontos totais do aluno
                    const pontosResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${aluno.id}`);
                    const pontosData = await pontosResponse.json();

                    // Encontrar o curso com a maior pontuação
                    let maxPontos = -1;
                    let cursoComMaiorPontuacao = '';

                    for (const key in pontosData) {
                        const curso = pontosData[key];
                        if (curso.pontosTotais > maxPontos) {
                            maxPontos = curso.pontosTotais;
                            cursoComMaiorPontuacao = curso.nomeCurso;
                        }
                    }

                    let medalhaTipo = 'bronze_medal'; // Tipo padrão

                    if (maxPontos > 600) {
                        medalhaTipo = 'gold_medal';
                    } else if (maxPontos > 500) {
                        medalhaTipo = 'silver_medal';
                    }

                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno_favoritos";

                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                        <img src="../imgs/${medalhaTipo}.png" alt="medalha">
                        <button onclick="desfavoritar(${aluno.id})">Desfavoritar</button>
                    `;

                    container.appendChild(alunoDiv);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar alunos favoritos:", error);
        }
    }

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
                for (const aluno of data) {
                    // Requisição para buscar todos os pontos totais do aluno
                    const pontosResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${aluno.id}`);
                    const pontosData = await pontosResponse.json();

                    // Encontrar o curso com a maior pontuação
                    let maxPontos = -1;
                    let cursoComMaiorPontuacao = '';

                    for (const key in pontosData) {
                        const curso = pontosData[key];
                        if (curso.pontosTotais > maxPontos) {
                            maxPontos = curso.pontosTotais;
                            cursoComMaiorPontuacao = curso.nomeCurso;
                        }
                    }

                    let medalhaTipo = 'bronze_medal'; // Tipo padrão

                    if (maxPontos > 600) {
                        medalhaTipo = 'gold_medal';
                    } else if (maxPontos > 500) {
                        medalhaTipo = 'silver_medal';
                    }

                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno";

                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a></span>
                        <img src="../imgs/${medalhaTipo}.png" alt="medalha">
                        <button onclick="atribuir(${aluno.id})">Atribuir</button>
                    `;

                    container.appendChild(alunoDiv);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar interessados:", error);
        }
    }



    window.desfavoritar = async function (idAluno) {
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

let idAlunoSelecionado = null;

// Chama a função listarContratados quando a página é carregada
window.onload = function () {
    listarContratados(); // Chama a função para listar alunos contratados
};

function atribuir(idAluno, fromListar = false) {
    idAlunoSelecionado = idAluno; 
    console.log("Aluno selecionado:", idAlunoSelecionado); 

    const atribuicaoDiv = document.getElementById("atribuicao");
    atribuicaoDiv.style.display = "flex"; 

    if (fromListar) {
        const boxProcessoSeletivo = document.querySelector(".box_atribuir:nth-child(3)");
        const blocoAtribuir = document.querySelector(".bloco_atribuir");

        if (boxProcessoSeletivo) {
            boxProcessoSeletivo.style.display = "none";
        }

        if (blocoAtribuir) {
            blocoAtribuir.style.height = "20vh"; // Define a altura apenas se chamado do listarProcessoSeletivo
        }
    }

    // Adiciona eventos aos botões
    const btnContratado = document.querySelector(".btn_contratado");
    btnContratado.onclick = () => contratarAluno(idAlunoSelecionado);

    const btnProcessoSeletivo = document.querySelector(".btn_processo_seletivo");
    btnProcessoSeletivo.onclick = () => processoSeletivoAluno(idAlunoSelecionado);

    const btnDesinteressar = document.querySelector(".btn_desinteressar");
    btnDesinteressar.onclick = () => desinteressarAluno(idAlunoSelecionado);
}

async function contratarAluno(idAlunoSelecionado) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/contratados/${idAlunoSelecionado}`, {
            method: "POST",
        });

        if (response.ok) {
            alert("Aluno contratado com sucesso!");
            listarContratados();
            fecharAtribuicao();
            setTimeout(() => {
                location.reload();
            }, 200);
        } else {
            alert("Erro ao contratar o aluno.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

async function listarContratados() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/listar/contratados`);
        const data = await response.json();

        const container = document.querySelector(".bloco_alunos_contratados");
        container.innerHTML = "";

        if (data.length === 0) {
            const noContractedMessage = document.createElement("p");
            noContractedMessage.textContent = "Não há alunos contratados no momento.";
            noContractedMessage.className = "no-alunos-message";
            container.appendChild(noContractedMessage);
        } else {
            for (const aluno of data) {
                const pontosResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${aluno.id}`);
                const pontosData = await pontosResponse.json();

                let maxPontos = -1;
                let cursoComMaiorPontuacao = '';

                for (const key in pontosData) {
                    const curso = pontosData[key];
                    if (curso.pontosTotais > maxPontos) {
                        maxPontos = curso.pontosTotais;
                        cursoComMaiorPontuacao = curso.nomeCurso;
                    }
                }

                let medalhaTipo = 'bronze_medal';

                if (maxPontos > 600) {
                    medalhaTipo = 'gold_medal';
                } else if (maxPontos > 500) {
                    medalhaTipo = 'silver_medal';
                }

                const alunoDiv = document.createElement("div");
                alunoDiv.className = "box_Aluno";
                alunoDiv.style.backgroundColor = "#9ABE62";
                alunoDiv.style.border = "3px solid #828282";
                alunoDiv.style.color = "#363636"

                alunoDiv.innerHTML = `
                    <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                    <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                    <img src="../imgs/${medalhaTipo}.png" alt="medalha">
                `;

                container.appendChild(alunoDiv);
            }
        }
    } catch (error) {
        console.error("Erro ao buscar alunos contratados:", error);
    }
}

async function processoSeletivoAluno(idAluno) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/processoSeletivo/${idAluno}`, {
            method: "POST",
        });
        if (response.ok) {
            alert("Aluno adicionado ao processo seletivo com sucesso!");
            await listarProcessoSeletivo(); // Aguarda a lista de alunos ser atualizada
            fecharAtribuicao(); // Presumindo que você tenha essa função
            setTimeout(() => {
                location.reload();
            }, 200);
        } else {
            alert("Erro ao adicionar o aluno no processo seletivo.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

async function listarProcessoSeletivo() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/listar/processoSeletivo`);
        const data = await response.json();

        const container = document.querySelector(".bloco_alunos_processo_seletivo");
        if (!container) {
            console.error("Elemento contêiner não encontrado.");
            return;
        }
        container.innerHTML = "";

        if (data.length === 0) {
            const noInterestedMessage = document.createElement("p");
            noInterestedMessage.textContent = "Não há alunos no processo seletivo no momento.";
            noInterestedMessage.className = "no-alunos-message";
            container.appendChild(noInterestedMessage);
        } else {
            for (const aluno of data) {
                const pontosResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${aluno.id}`);
                const pontosData = await pontosResponse.json();

                let maxPontos = -1;
                let cursoComMaiorPontuacao = '';

                for (const key in pontosData) {
                    const curso = pontosData[key];
                    if (curso.pontosTotais > maxPontos) {
                        maxPontos = curso.pontosTotais;
                        cursoComMaiorPontuacao = curso.nomeCurso;
                    }
                }

                let medalhaTipo = 'bronze_medal';

                if (maxPontos > 600) {
                    medalhaTipo = 'gold_medal';
                } else if (maxPontos > 500) {
                    medalhaTipo = 'silver_medal';
                }

                const alunoDiv = document.createElement("div");
                alunoDiv.className = "box_Aluno";
                alunoDiv.style.backgroundColor = "#FFE879";
                alunoDiv.style.border = "3px solid #828282";
                alunoDiv.style.color = "#363636";

                alunoDiv.innerHTML = `
                    <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                    <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                    <img src="../imgs/${medalhaTipo}.png" alt="medalha">
                    <button onclick="atribuir(${aluno.id}, true)">Atribuir</button>
                `;

                container.appendChild(alunoDiv);
            }
        }
    } catch (error) {
        console.error("Erro ao buscar alunos no processo seletivo:", error);
    }
}

document.addEventListener("DOMContentLoaded", listarProcessoSeletivo);

async function desinteressarAluno(idAluno) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/cancelados/${idAluno}`, {
            method: "POST",
        });
        if (response.ok) {
            alert("Interesse cancelado com sucesso!");
            fecharAtribuicao();
            fecharAtribuicao(); // Presumindo que você tenha essa função
            setTimeout(() => {
                location.reload();
            }, 200);
        } else {
            alert("Erro ao cancelar interesse.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fecharBtn = document.querySelector('.fechar');

    // Verifica se o botão de fechar está corretamente selecionado
    if (fecharBtn) {
        fecharBtn.addEventListener('click', function () {
            console.log('Fechar botão clicado'); // Para verificar se o evento é acionado
            document.getElementById('atribuicao').style.display = 'none';
        });
    } else {
        console.error('Elemento fechar não encontrado');
    }
});

// Função para fechar a div de atribuição
function fecharAtribuicao() {
    const atribuicaoDiv = document.getElementById("atribuicao");
    atribuicaoDiv.style.display = "none"; // Oculta a div de atribuição
}

