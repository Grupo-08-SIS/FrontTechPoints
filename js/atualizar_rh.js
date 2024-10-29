import { obterMedalha } from './medalhas.js';
window.atribuir = atribuir;
window.salvarMudancas = salvarMudancas
window.fazerLogout = fazerLogout
window.editarPerfil = editarPerfil
window.fecharFormulario = fecharFormulario

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

    if (novaSenha && novaSenha !== confirmacaoSenha) {
        alert('As senhas não coincidem.');
        return;
    }

    const dados = {};

    dados.nomeUsuario = `${novoPrimeiroNome || dadosUsuarioAtual.primeiroNome} ${novoSobrenome || dadosUsuarioAtual.sobrenome}`.trim();

    if (novoPrimeiroNome) dados.primeiroNome = novoPrimeiroNome;
    if (novoSobrenome) dados.sobrenome = novoSobrenome;
    if (telefone) dados.telefone = telefone;
    if (email) dados.email = email;
    if (novaSenha) dados.senha = novaSenha;

    const userId = getIdUsuarioLogado(); 
    const endpoint = `http://localhost:8080/usuarios/atualizar/${userId}`;

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
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id) {
        console.error('ID do usuário não encontrado no sessionStorage.');
        return;
    }

    const idUsuario = user.id;

    async function listarInteressados() {
        try {
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/listar/interessados`);
            const data = await response.json();
    
            const container = document.querySelector(".bloco_alunos");
            container.innerHTML = ""; 
    
            if (data.length === 0) {
                const noInterestedMessage = document.createElement("p");
                noInterestedMessage.textContent = "Não há alunos interessados no momento.";
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
                    alunoDiv.className = "box_Aluno";
    
                    alunoDiv.innerHTML = `
                        <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                        <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a></span>
                        <img src="../imgs/${medalhaTipo}" alt="medalha">
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
            const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuario}/cancelados/${idAluno}`, {
                method: 'POST',
            });

            if (response.ok) {
                console.log(`Aluno com ID ${idAluno} cancelado.`);
            } else {
                console.error('Erro ao cancelar o aluno.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', options);
    }

    listarInteressados();
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
            blocoAtribuir.style.height = "20vh";
        }
    }

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
            showAlert('Aluno contratado com sucesso!', 'success');
            listarContratados();
            fecharAtribuicao();
            setTimeout(() => {
                location.reload();
            }, 1000);
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

                const medalhaTipo = obterMedalha(maxPontos);

                const alunoDiv = document.createElement("div");
                alunoDiv.className = "box_Aluno";
                alunoDiv.style.backgroundColor = "#9ABE62";
                alunoDiv.style.border = "3px solid #828282";
                alunoDiv.style.color = "#363636";

                alunoDiv.innerHTML = `
                    <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                    <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                    <img src="../imgs/${medalhaTipo}" alt="medalha">
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
            showAlert('Aluno movido para o processo seletivo!', 'success');
            await listarProcessoSeletivo(); 
            fecharAtribuicao(); 
            setTimeout(() => {
                location.reload();
            }, 1000);
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

                const medalhaTipo = obterMedalha(maxPontos);

                const alunoDiv = document.createElement("div");
                alunoDiv.className = "box_Aluno";
                alunoDiv.style.backgroundColor = "#FFE879";
                alunoDiv.style.border = "3px solid #828282";
                alunoDiv.style.color = "#363636";

                alunoDiv.innerHTML = `
                    <span>${aluno.primeiroNome} ${aluno.sobrenome}</span>
                    <span>Aluno do projeto arrastão, finalizou curso <a>${cursoComMaiorPontuacao}</a> com ${maxPontos} pontos</span>
                    <img src="../imgs/${medalhaTipo}" alt="medalha">
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

