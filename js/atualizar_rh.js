import { obterMedalha } from './medalhas.js';
window.atribuir = atribuir;
window.salvarMudancas = salvarMudancas
window.editarPerfil = editarPerfil
window.fecharFormulario = fecharFormulario
window.desinteressarAluno = desinteressarAluno
window.interessarAluno = interessarAluno

const loader = document.querySelector('.container_loader');

function getIdUsuarioLogado() {
    const data = JSON.parse(sessionStorage.getItem('user'))

    console.log(data)
    return data.id;
}

async function salvarMudancas(event) {
    event.preventDefault();

    const novoPrimeiroNome = document.getElementById('novo_apelido').value;
    const novoSobrenome = document.getElementById('novo_sobrenome').value;
    const telefone = document.getElementById('novo_telefone').value;
    const email = document.getElementById('email').value;
    const novaSenha = document.getElementById('nova_senha').value;
    const confirmacaoSenha = document.getElementById('nova_senha_confirmacao').value;
    const data = JSON.parse(sessionStorage.getItem('user'))

    // Validação das senhas
    if (novaSenha && novaSenha !== confirmacaoSenha) {
        showAlert('As senhas não coincidem.', 'error');
        return;
    }

    // Validação do comprimento da senha
    if (novaSenha && novaSenha.length < 6) {
        showAlert('A senha deve ter no mínimo 6 caracteres.', 'error');
        return;
    }

    // Validação do primeiro nome e sobrenome
    if (novoPrimeiroNome && !novoSobrenome) {
        showAlert('Você precisa mudar o sobrenome junto com o nome.', 'error');
        return;
    }

    // Validação do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Verifica se o e-mail tem o formato correto
    if (email && !emailRegex.test(email)) {
        showAlert('Por favor, insira um e-mail válido (exemplo@dominio.com).', 'error');
        return;
    }

    // Validação do telefone
    const telefoneRegex = /^\d{10,11}$/; // Verifica se o telefone contém entre 10 e 11 dígitos numéricos
    if (telefone && !telefoneRegex.test(telefone)) {
        showAlert('O telefone deve ter entre 10 e 11 dígitos numéricos.', 'error');
        return;
    }

    const dados = {};
    dados.nomeUsuario = `${novoPrimeiroNome || data.primeiroNome} ${novoSobrenome || data.sobrenome}`.trim();

    if (novoPrimeiroNome) dados.primeiroNome = novoPrimeiroNome;
    if (novoSobrenome) dados.sobrenome = novoSobrenome;
    if (telefone) dados.telefone = telefone;
    if (email) dados.email = email;
    if (novaSenha) dados.senha = novaSenha;

    const userId = getIdUsuarioLogado();
    const endpoint = `http://localhost:8080/usuarios/atualizar/${userId}`;
    loader.style.display = 'flex';

    try {
        const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        if (response.ok) {
            showAlert('Informações atualizadas com sucesso! Você será redirecionado para a tela de login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            const error = await response.json();
            showAlert(`Erro: ${error.message || 'Não foi possível atualizar as informações.'}`, 'error');
        }
    } catch (error) {
        showAlert(`Erro: ${error.message}`, 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alerta');
    const alertTitle = alertBox.querySelector('.titulo_alerta');
    const alertText = alertBox.querySelector('.texto_alerta');

    alertTitle.textContent = type === 'success' ? 'Sucesso' : 'Erro';
    alertText.textContent = message;

    alertBox.className = `container_alerta show ${type}`;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.style.opacity = '1';
        }, 500);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", async function () {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id) {
        console.error('ID do usuário não encontrado no sessionStorage.');
        return;
    }

    const idUsuario = user.id;

    async function listarFavoritos() {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/favoritos`);
            const data = await response.json();

            const container = document.querySelector(".bloco_alunos_favoritos");
            container.innerHTML = "";

            if (data.length > 3) {
                container.style.display = "flex";
                container.style.flexWrap = "nowrap";
                container.style.overflowX = "auto";
                container.style.width = "90%";
                container.style.justifyContent = "flex-start";
            }

            if (data.length === 0) {
                container.style.height = "auto";  // Remove o valor fixo de 10vh e ajusta a altura ao conteúdo
                const noFavoritesMessage = document.createElement("p");
                noFavoritesMessage.textContent = "Não há alunos favoritos no momento.";
                noFavoritesMessage.className = "no-alunos-message";
                container.appendChild(noFavoritesMessage);
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

                    const medalhaTipo = obterMedalha(maxPontos);

                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno_favoritos";

                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                        <img src="../imgs/${medalhaTipo}" alt="medalha">
                        <div class="button-container">
                        <button onclick="interessarAluno(${aluno.id})">Interessar</button>
                            <button onclick="desfavoritar(${aluno.id})">Desfavoritar</button>
                        </div>
                    `;

                    container.appendChild(alunoDiv);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar alunos favoritos:", error);
        } finally {
            loader.style.display = 'z';
        }
    }

    async function listarInteressados() {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/interessados`);
            const data = await response.json();
    
            const container = document.querySelector(".bloco_alunos");
            container.innerHTML = ""; // Limpando o conteúdo do contêiner antes de adicionar os novos itens
    
            sessionStorage.setItem('quantidadeInteressados', data.length);
    
            // Verificando se o número de alunos interessados é maior que 3 para aplicar o estilo de rolagem horizontal
            if (data.length > 3) {
                container.style.display = "flex";
                container.style.flexWrap = "nowrap";
                container.style.width = "90%";
                container.style.justifyContent = "flex-start";
            }
    
            // Caso não haja alunos interessados, exibe uma mensagem
            if (data.length === 0) {
                const noInterestedMessage = document.createElement("p");
                noInterestedMessage.textContent = "Não há alunos interessados no momento.";
                noInterestedMessage.className = "no-alunos-message";
                container.appendChild(noInterestedMessage);
            } else {
                // Para cada aluno, buscamos suas pontuações e renderizamos na tela
                for (const aluno of data) {
                    const pontosResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${aluno.id}`);
                    const pontosData = await pontosResponse.json();
    
                    let maxPontos = -1;
                    let cursoComMaiorPontuacao = '';
    
                    // Determinando o curso com a maior pontuação
                    for (const key in pontosData) {
                        const curso = pontosData[key];
                        if (curso.pontosTotais > maxPontos) {
                            maxPontos = curso.pontosTotais;
                            cursoComMaiorPontuacao = curso.nomeCurso;
                        }
                    }
    
                    // Obtendo o tipo de medalha com base nos pontos
                    const medalhaTipo = obterMedalha(maxPontos);
    
                    // Criando o elemento do aluno
                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno_favoritos";
    
                    const alunoButton = document.createElement("button");
                    alunoButton.textContent = "Atribuir";
                    alunoButton.onclick = () => atribuir(aluno.id, false, 'interessados');
                    
                    // Mudando a cor do botão diretamente no JavaScript
                    alunoButton.style.backgroundColor = "#1E3A8A"; // Cor de fundo
                    alunoButton.style.color = "white"; // Cor do texto
    
                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a></span>
                        <img src="../imgs/${medalhaTipo}" alt="medalha">
                    `;
                    
                    alunoDiv.appendChild(alunoButton);
                    container.appendChild(alunoDiv);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar interessados:", error);
        } finally {
            loader.style.display = 'none';
        }
    }    

    async function listarCancelados() {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/cancelados`);
            const data = await response.json();
    
            const container = document.querySelector(".bloco_alunos_cancelados");
            container.innerHTML = ""; // Limpa o contêiner
    
            // Se não houver alunos cancelados
            if (data.length === 0) {
                const noInterestedMessage = document.createElement("p");
                noInterestedMessage.textContent = "Não há alunos cancelados no momento.";
                noInterestedMessage.className = "no-alunos-message";
                container.appendChild(noInterestedMessage);
                container.style.justifyContent = "center";
                container.style.width = "40%";
                container.style.display = "flex"; // Garante que o container é exibido mesmo quando vazio
            } else {
                const alunoDivs = [];
    
                // Itera sobre os alunos e cria as divs
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
    
                    const medalhaTipo = obterMedalha(maxPontos);
    
                    const alunoDiv = document.createElement("div");
                    alunoDiv.className = "box_Aluno_favoritos";
                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a></span>
                        <img src="../imgs/${medalhaTipo}" alt="medalha">
                    `;
    
                    alunoDiv.style.backgroundColor = '#F0F0F0';
                    alunoDiv.style.color = '#808080';
    
                    alunoDivs.push(alunoDiv);
                }
    
                // Adiciona todos os alunos ao contêiner na ordem invertida
                for (let i = alunoDivs.length - 1; i >= 0; i--) {
                    container.appendChild(alunoDivs[i]); // Adiciona na ordem invertida
                }
    
                // Verifica se há dados no localStorage para as chaves "favoritos" ou "desinteressados"
                const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
                const desinteressados = JSON.parse(localStorage.getItem("desinteressados") || "[]");
    
                // Verifica cada aluno e se ele não tem referência no localStorage, remove com o endpoint
                for (const alunoDiv of alunoDivs) {
                    const alunoId = alunoDiv.querySelector("span").textContent.trim(); // Extraí o nome do aluno
                    const aluno = data.find(a => `${a.primeiroNome} ${a.sobrenome}` === alunoId);
    
                    // Verifica se esse aluno não está na lista de favoritos ou desinteressados no localStorage
                    const isFavorito = favoritos.some(f => f.id === aluno.id);
                    const isDesinteressado = desinteressados.some(d => d.id === aluno.id);
    
                    if (!isFavorito && !isDesinteressado) {
                        // Se o aluno não está em nenhuma das listas no localStorage, chama o endpoint para removê-lo
                        console.log(`Removendo aluno com ID ${aluno.id} - ${aluno.primeiroNome} ${aluno.sobrenome}...`);
                        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/contratados/${aluno.id}`, {
                            method: 'DELETE', // Usando DELETE ou o método apropriado
                        });
    
                        if (response.ok) {
                            console.log(`Aluno ${aluno.primeiroNome} ${aluno.sobrenome} removido com sucesso!`);
                        } else {
                            console.error(`Erro ao remover aluno ${aluno.primeiroNome} ${aluno.sobrenome}:`, response.statusText);
                        }
    
                        // Remove o aluno da lista
                        alunoDiv.remove();
                        console.log(`Aluno ${aluno.primeiroNome} ${aluno.sobrenome} removido da lista visual.`);
                    } else {
                        // Adiciona o botão "Desfazer" ao último aluno apenas se uma das chaves existir no localStorage
                        alunoDiv.innerHTML += `<button onclick="desfazer(${aluno.id})">Desfazer</button>`;
                    }
                }
    
                // Se não houver mais alunos no contêiner após as remoções, exibe a mensagem
                if (container.children.length === 0) {
                    const noInterestedMessage = document.createElement("p");
                    noInterestedMessage.textContent = "Não há alunos cancelados no momento.";
                    noInterestedMessage.className = "no-alunos-message";
                    container.appendChild(noInterestedMessage);
                    container.style.justifyContent = "center";
                    container.style.width = "40%";
                    container.style.display = "flex"; // Garante que o container é exibido mesmo quando vazio
                }
            }
        } catch (error) {
            console.error("Erro ao buscar cancelados:", error);
        } finally {
            loader.style.display = 'none';
        }
    }    

    window.desfazer = async function (idAluno) {
        loader.style.display = 'flex';
    
        // Recupera as listas do localStorage
        let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        let desinteressados = JSON.parse(localStorage.getItem('desinteressados')) || [];
    
        // Logar as listas para verificar o que contém
        console.log('Favoritos:', favoritos);
        console.log('Desinteressados:', desinteressados);
    
        // Verifica se o aluno está nas listas, convertendo idAluno para número
        const alunoFavoritosIndex = favoritos.findIndex(favorito => Number(favorito.id) === Number(idAluno));
        const alunoDesinteressadosIndex = desinteressados.findIndex(interessado => Number(interessado.id) === Number(idAluno));
    
        try {
            let response;
    
            // Se o aluno estiver na lista de favoritos
            if (alunoFavoritosIndex !== -1) {
                response = await fetch(`http://localhost:8080/dashboardRecrutador/${getIdUsuarioLogado()}/favoritos/${idAluno}`, {
                    method: 'POST',
                });
    
                if (response.ok) {
                    // Remove o aluno da lista de favoritos
                    favoritos.splice(alunoFavoritosIndex, 1);
                    localStorage.setItem('favoritos', JSON.stringify(favoritos));
                    console.log(`Aluno com ID ${idAluno} foi restaurado e removido dos favoritos.`);
                    showAlert('Aluno restaurado com sucesso!', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    console.error('Erro ao restaurar aluno dos favoritos:', response.statusText);
                }
    
            // Se o aluno estiver na lista de desinteressados
            } else if (alunoDesinteressadosIndex !== -1) {
                const alunoDesinteressado = desinteressados[alunoDesinteressadosIndex];
                const listaAssociada = alunoDesinteressado.lista; // Captura a lista associada
    
                // Define o endpoint com base na lista associada
                response = await fetch(`http://localhost:8080/dashboardRecrutador/${getIdUsuarioLogado()}/${listaAssociada}/${idAluno}`, {
                    method: 'POST',
                });
    
                if (response.ok) {
                    // Remove o aluno da lista de desinteressados
                    desinteressados.splice(alunoDesinteressadosIndex, 1);
                    localStorage.setItem('desinteressados', JSON.stringify(desinteressados));
                    console.log(`Aluno com ID ${idAluno} foi restaurado e removido dos desinteressados.`);
                    showAlert('Aluno restaurado com sucesso!', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    console.error('Erro ao restaurar aluno dos desinteressados:', response.statusText);
                }
            } else {
                console.log(`Aluno com ID ${idAluno} não está em nenhuma das listas.`);
            }
        } catch (error) {
            console.error('Erro ao chamar o endpoint:', error);
        } finally {
            loader.style.display = 'none';
        }
    };    

    window.desfavoritar = async function (idAluno) {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/cancelados/${idAluno}`, {
                method: 'POST',
            });

            if (response.ok) {
                // Criar um objeto com os dados do aluno
                const alunoData = {
                    id: idAluno,
                    lista: 'favoritos' // Nome da lista
                };

                // Recuperar a lista existente de alunos do localStorage, se houver
                let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

                // Adicionar o aluno à lista de favoritos
                favoritos.push(alunoData);

                // Armazenar a lista atualizada de favoritos no localStorage
                localStorage.setItem('favoritos', JSON.stringify(favoritos));

                console.log(`Aluno com ID ${idAluno} cancelado e adicionado aos favoritos.`);
                showAlert('Aluno desfavoritado com sucesso!', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                console.error('Erro ao cancelar o aluno.');
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            loader.style.display = 'none';
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', options);
    }

    listarFavoritos();
    listarInteressados();
    listarCancelados();
    window.formatDate = formatDate
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

window.onload = function () {
    listarContratados();
};

function atribuir(idAluno, fromListar = false, elementoChamador = null) {
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
            blocoAtribuir.style.height = "20vh";
        }
    }

    const btnContratado = document.querySelector(".btn_contratado");
    btnContratado.onclick = () => contratarAluno(idAlunoSelecionado);

    const btnProcessoSeletivo = document.querySelector(".btn_processo_seletivo");
    btnProcessoSeletivo.onclick = () => processoSeletivoAluno(idAlunoSelecionado);

    const btnDesinteressar = document.querySelector(".btn_desinteressar");
    btnDesinteressar.onclick = () => desinteressarAluno(idAlunoSelecionado, elementoChamador);

    if (elementoChamador) {
        console.log("Chamado a partir do elemento:", elementoChamador);
    }
}

async function interessarAluno(idAlunoSelecionado) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    // Exibe o loader
    const loader = document.querySelector('.container_loader');
    loader.style.display = 'flex';

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/interessados/${idAlunoSelecionado}`, {
            method: "POST",
        });

        if (response.ok) {
            showAlert('Aluno marcado como interessado com sucesso!', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert("Erro ao marcar o aluno como interessado.");
        }
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        loader.style.display = 'none';
    }
}

async function contratarAluno(idAluno) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    // Exibe o loader
    const loader = document.querySelector('.container_loader');
    loader.style.display = 'flex';
    fecharAtribuicao();

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/contratados/${idAluno}`, {
            method: "POST",
        });

        if (response.ok) {
            showAlert('Aluno movido para a lista de contratados!', 'success');

            await listarContratados();

            const contratadosData = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/listar/contratados`);
            const contratados = await contratadosData.json();
            sessionStorage.setItem('quantidadeContratados', contratados.length);

            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert("Erro ao adicionar o aluno no contratados.");
        }
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        // Oculta o loader
        loader.style.display = 'none';
    }
}

const pageSize = 6;  // Número de alunos por página
let currentPage = 1; // Página inicial

async function listarContratados() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;
    loader.style.display = 'flex';

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
            return;  
        }

        data.reverse();

        const totalPages = Math.ceil(data.length / pageSize);

        mostrarAlunosPorPagina(data);

        const paginationContainer = document.querySelector(".pagination");
        paginationContainer.innerHTML = "";  

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.classList.add("page-btn");
            paginationContainer.appendChild(pageButton);

            pageButton.addEventListener('click', () => {
                currentPage = i;
                mostrarAlunosPorPagina(data);
            });
        }

    } catch (error) {
        console.error("Erro ao buscar alunos contratados:", error);
    } finally {
        loader.style.display = 'none';
    }
}

function mostrarAlunosPorPagina(data) {
    const container = document.querySelector(".bloco_alunos_contratados");
    container.classList.remove("show");  

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const alunosToDisplay = data.slice(start, end);

    container.innerHTML = "";  
    for (const aluno of alunosToDisplay) {
        const alunoDiv = document.createElement("div");
        alunoDiv.className = "box_Aluno_favoritos";
        alunoDiv.style.backgroundColor = "#f1f7e4";
        alunoDiv.style.border = "3px solid #4CAF50";
        alunoDiv.style.color = "#333333";
        alunoDiv.innerHTML = `
            <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
            <span>Aluno do projeto arrastão</span>
        `;
        container.appendChild(alunoDiv);
    }

    setTimeout(() => {
        container.classList.add("show");
    }, 50); 
}

async function processoSeletivoAluno(idAluno) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;

    const loader = document.querySelector('.container_loader');
    loader.style.display = 'flex';
    fecharAtribuicao();

    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/processoSeletivo/${idAluno}`, {
            method: "POST",
        });

        if (response.ok) {
            showAlert('Aluno movido para o processo seletivo!', 'success');

            await listarProcessoSeletivo();

            const processoSeletivoData = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/listar/processoSeletivo`);
            const processoSeletivo = await processoSeletivoData.json();
            sessionStorage.setItem('quantidadeProcessoSeletivo', processoSeletivo.length);

            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert("Erro ao adicionar o aluno no processo seletivo.");
        }
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        loader.style.display = 'none';
    }
}

async function listarProcessoSeletivo() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;
    loader.style.display = 'flex';
    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/listar/processoSeletivo`);
        const data = await response.json();

        const container = document.querySelector(".bloco_alunos_processo_seletivo");
        if (!container) {
            console.error("Elemento contêiner não encontrado.");
            return;
        }
        container.innerHTML = "";

        if (data.length > 3) {
            container.style.display = "flex";
            container.style.flexWrap = "nowrap";
            container.style.width = "90%";
            container.style.justifyContent = "flex-start";
        }

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

                const medalhaTipo = obterMedalha(maxPontos);

                const alunoDiv = document.createElement("div");
                alunoDiv.className = "box_Aluno_favoritos";

                alunoDiv.style.border = "2px solid #FABC09"; 

                alunoDiv.innerHTML = `
                    <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                    <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                    <img src="../imgs/${medalhaTipo}" alt="medalha">
                    <button onclick="atribuir(${aluno.id}, true, 'processoSeletivo')">Atribuir</button>
                `;

                const alunoButton = alunoDiv.querySelector("button");
                alunoButton.style.backgroundColor = "#1E3A8A"; 
                alunoButton.style.color = "white"; 

                container.appendChild(alunoDiv);
            }
        }
    } catch (error) {
        console.error("Erro ao buscar alunos no processo seletivo:", error);
    } finally {
        loader.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", listarProcessoSeletivo);

async function desinteressarAluno(idAluno, elementoChamador) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const idRecrutador = user.id;
    loader.style.display = 'flex';
    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idRecrutador}/cancelados/${idAluno}`, {
            method: "POST",
        });

        if (response.ok) {
            const alunoData = {
                id: idAluno,
                lista: elementoChamador 
            };

            let desinteressados = JSON.parse(localStorage.getItem('desinteressados')) || [];

            desinteressados.push(alunoData);

            localStorage.setItem('desinteressados', JSON.stringify(desinteressados));

            showAlert('Interesse cancelado com sucesso!', 'success');
            fecharAtribuicao();

            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert("Erro ao cancelar interesse.");
        }
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        loader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fecharBtn = document.querySelector('.fechar');

    if (fecharBtn) {
        fecharBtn.addEventListener('click', function () {
            console.log('Fechar botão clicado');
            document.getElementById('atribuicao').style.display = 'none';
        });
    } else {
        console.error('Elemento fechar não encontrado');
    }
});

function fecharAtribuicao() {
    const atribuicaoDiv = document.getElementById("atribuicao");
    atribuicaoDiv.style.display = "none";
}

