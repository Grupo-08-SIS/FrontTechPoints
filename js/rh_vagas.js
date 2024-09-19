document.addEventListener('DOMContentLoaded', async function () {
    await carregarCursos(); // Carrega os cursos ao inicializar
    await atualizarAlunos(); // Chama a função para mostrar todos os alunos inicialmente

    const cursosSelect = document.getElementById('cursos');
    cursosSelect.addEventListener('change', exibirAlunosPorCurso);
});

async function carregarCursos() {
    try {
        const response = await fetch('http://localhost:8080/pontuacoes/ranking');
        const data = await response.json();

        const cursosSelect = document.getElementById('cursos');
        cursosSelect.innerHTML = '<option value="opc_cursos">Cursos</option>'; // Limpa opções existentes

        // Itera sobre os cursos e cria as opções
        for (const cursoId in data) {
            const nomeCurso = data[cursoId].nomeCurso;
            const option = document.createElement('option');
            option.value = cursoId; // Define o valor da opção como o ID do curso
            option.textContent = nomeCurso; // Define o texto da opção como o nome do curso
            cursosSelect.appendChild(option); // Adiciona a opção ao select
        }
    } catch (error) {
        console.error('Erro ao carregar os dados dos cursos:', error);
    }
}

async function exibirAlunosPorCurso() {
    const cursoId = this.value; // Pega o ID do curso selecionado

    // Se a opção padrão for selecionada, chama atualizarAlunos()
    if (cursoId === 'opc_cursos') {
        await atualizarAlunos();
        return; // Sai da função
    }

    // Lógica para exibir alunos do curso selecionado
    try {
        const response = await fetch(`http://localhost:8080/pontuacoes/alunos`);
        const data = await response.json();

        const containerCursos = document.getElementById('cursos_container');
        containerCursos.innerHTML = ''; // Limpa o container antes de mostrar os alunos

        const curso = data[cursoId];
        if (!curso) {
            console.error(`Curso com ID ${cursoId} não encontrado.`);
            return;
        }

        const cursoDiv = document.createElement('div');
        cursoDiv.innerHTML = `
            <div class="container_curso_imagem_nome">
                <div class="bloco_nome_imagem_curso">
                    <h1 id="nome_curso_${cursoId}">${curso.nomeCurso}</h1>
                </div>
            </div>

            <div class="container_fundo_aluno">
                <div id="bloco_alunos_${cursoId}" class="bloco_alunos">
                    <!-- Alunos serão adicionados aqui -->
                </div>
            </div>
        `;

        containerCursos.appendChild(cursoDiv);

        const alunos = curso.ranking || []; // Pega os alunos do curso
        const blocoAlunos = document.getElementById(`bloco_alunos_${cursoId}`);

        if (!blocoAlunos) {
            console.error(`Bloco de alunos para o curso ${cursoId} não encontrado.`);
            return;
        }

        alunos.forEach(aluno => {
            const alunoDiv = document.createElement('div');
            alunoDiv.className = 'box_Aluno';

            const medalha = aluno.pontosTotais > 600 ? 'gold_medal.png' :
                aluno.pontosTotais > 500 ? 'silver_medal.png' :
                    'bronze_medal.png';

            alunoDiv.innerHTML = `
                <span>${aluno.aluno.primeiroNome} ${aluno.aluno.sobrenome}</span>
                <span>Aluno do projeto arrastão, finalizou curso <a>${curso.nomeCurso}</a> com ${aluno.pontosTotais} pontos</span>
                <img src="../imgs/${medalha}" alt="medalha">
                <button onclick="verMais(${aluno.aluno.id})">Ver mais</button>
            `;

            blocoAlunos.appendChild(alunoDiv);
        });

    } catch (error) {
        console.error('Erro ao carregar os dados dos alunos:', error);
    }
}

async function atualizarAlunos() {
    try {
        const idUsuarioLogado = getIdUsuarioLogado(); 

        const interessadosResponse = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuarioLogado}/listar/interessados`);
        const interessadosData = await interessadosResponse.json();
        const idsInteressados = interessadosData.map(aluno => aluno.id);

        // Busca os cursos e alunos
        const cursosResponse = await fetch('http://localhost:8080/pontuacoes/alunos');
        const data = await cursosResponse.json();

        const containerCursos = document.getElementById('cursos_container');
        if (!containerCursos) {
            console.error('Contêiner de cursos não encontrado.');
            return;
        }

        containerCursos.innerHTML = ''; 

        const cursoIds = Object.keys(data);
        const cursosEmbaralhados = shuffleArray(cursoIds);

        for (let i = 0; i < cursosEmbaralhados.length; i++) {
            const cursoId = cursosEmbaralhados[i];
            const curso = data[cursoId];

            const cursoDiv = document.createElement('div');
            cursoDiv.innerHTML = `
                <div class="container_curso_imagem_nome">
                    <div class="bloco_nome_imagem_curso">
                        <h1 id="nome_curso_${cursoId}">${curso.nomeCurso}</h1>
                    </div>
                </div>

                <div class="container_fundo_aluno">
                    <div id="bloco_alunos_${cursoId}" class="bloco_alunos">
                        <!-- Alunos serão adicionados aqui -->
                    </div>
                </div>
            `;

            containerCursos.appendChild(cursoDiv);

            let alunos = curso.ranking;
            alunos = shuffleArray(alunos);

            const blocoAlunos = document.getElementById(`bloco_alunos_${cursoId}`);

            if (!blocoAlunos) {
                console.error(`Bloco de alunos para o curso ${cursoId} não encontrado.`);
                continue;
            }

            const maxAlunos = 3;
            let alunosExibidos = [];
            let alunosParaExibir = [];

            for (const aluno of alunos) {
                if (!idsInteressados.includes(aluno.aluno.id)) {
                    alunosParaExibir.push(aluno);
                }
            }

            if (alunosParaExibir.length > 0) {
                for (const aluno of alunosParaExibir) {
                    if (alunosExibidos.length < maxAlunos) {
                        const alunoDiv = document.createElement('div');
                        alunoDiv.className = 'box_Aluno';

                        const medalha = aluno.pontosTotais > 600 ? 'gold_medal.png' :
                            aluno.pontosTotais > 500 ? 'silver_medal.png' :
                                'bronze_medal.png';

                        alunoDiv.innerHTML = `
                            <span>${aluno.aluno.primeiroNome} ${aluno.aluno.sobrenome}</span>
                            <span>Aluno do projeto arrastão, finalizou curso <a>${curso.nomeCurso}</a> com ${aluno.pontosTotais} pontos</span>
                            <img src="../imgs/${medalha}" alt="medalha">
                            <button onclick="verMais(${aluno.aluno.id})">Ver mais</button>
                        `;

                        blocoAlunos.appendChild(alunoDiv);
                        alunosExibidos.push(aluno.aluno.id);
                    }
                }

                if (alunosExibidos.length === 0) {
                    const mensagem = document.createElement('div');
                    mensagem.className = 'mensagem_no_alunos';
                    mensagem.innerText = 'Todos os alunos desse curso já foram visualizados.';
                    blocoAlunos.appendChild(mensagem);
                }
            } else {
                const mensagem = document.createElement('div');
                mensagem.className = 'mensagem_no_alunos';
                mensagem.innerText = 'Todos os alunos desse curso já foram visualizados.';
                blocoAlunos.appendChild(mensagem);
            }

            if (i < cursosEmbaralhados.length - 1) {
                const espacoDiv = document.createElement('div');
                espacoDiv.className = 'container_espacamento';
                espacoDiv.innerHTML = `
                    <div class="bloco_espacamento"></div>
                `;
                containerCursos.appendChild(espacoDiv);
            }
        }

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function alunoRemovido() {
    atualizarAlunos();
}

async function verMais(alunoId) {
    try {
        const idUsuarioLogado = getIdUsuarioLogado(); // Função que obtém o ID do usuário logado

        // Requisição para buscar os detalhes do aluno
        const response = await fetch(`http://localhost:8080/usuarios/buscar/${alunoId}`);
        const aluno = await response.json();

        // Defina o nome do aluno
        const nomeAluno = `${aluno.primeiroNome} ${aluno.sobrenome}`;

        // Atualize o conteúdo da página com as informações do aluno
        document.getElementById('nome_do_aluno').innerText = nomeAluno;
        const idade = calcularIdade(aluno.dataNascimento);
        document.getElementById('idade_do_aluno').innerText = `${idade} anos`;
        document.getElementById('municipio_do_aluno').innerText = aluno.endereco.cidade;
        document.getElementById('escolaridade_do_aluno').innerText = aluno.escolaridade;
        document.getElementById('email_do_aluno').innerText = aluno.email;
        document.getElementById('descricao_do_aluno').innerText = aluno.descricao;

        // Carregar a foto do aluno
        const imgElement = document.querySelector('.bloco_foto_aluno img');
        const fotoResponse = await fetch(`http://localhost:8080/usuarios/imagem/${alunoId}`);
        if (fotoResponse.ok) {
            const blob = await fotoResponse.blob();
            const fotoUrl = URL.createObjectURL(blob);
            imgElement.src = fotoUrl;
        } else {
            imgElement.src = '/imgs/foto_padrao.png';
        }

        // Carregar os emblemas
        const emblemasResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${alunoId}`);
        const emblemasData = await emblemasResponse.json();

        const emblemasContainer = document.querySelector('.container_emblemas');
        emblemasContainer.innerHTML = '';

        const blocoEmblemas = document.createElement('div');
        blocoEmblemas.classList.add('bloco_emblemas');

        for (const key in emblemasData) {
            const emblema = emblemasData[key];
            const pontos = emblema.pontosTotais;
            let emblemaTipo = 'bronze_medal';

            if (pontos > 600) {
                emblemaTipo = 'gold_medal';
            } else if (pontos > 500) {
                emblemaTipo = 'silver_medal';
            }

            const emblemaElement = document.createElement('div');
            emblemaElement.classList.add('box_emblemas');
            emblemaElement.innerHTML = `<img src="/imgs/${emblemaTipo}.png" alt="${emblema.nomeCurso}">`;
            blocoEmblemas.appendChild(emblemaElement);
        }

        emblemasContainer.appendChild(blocoEmblemas);

        const blocoInfoAluno = document.querySelector('.bloco_info_aluno');
        const containerBotaoInteresse = document.querySelector('.bloco_botao_interesse');

        // Limpa os botões anteriores
        blocoInfoAluno.innerHTML = `
            <h1 id="nome_do_aluno">${nomeAluno}</h1>
            <span>Idade: <span id="idade_do_aluno">${idade}</span> anos</span>
            <span>Município: <span id="municipio_do_aluno">${aluno.endereco.cidade}</span></span>
            <span>Escolaridade: <span id="escolaridade_do_aluno">${aluno.escolaridade}</span></span>
            <span>Email: <span id="email_do_aluno">${aluno.email}</span></span>
        `;

        // Verifica se o aluno já está na lista de favoritos
        const favoritosResponse = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuarioLogado}/listar/favoritos`);
        const favoritosData = await favoritosResponse.json();

        // Cria o botão "Favoritar" ou "Desfavoritar"
        const favoritarButton = document.createElement('button');
        favoritarButton.classList.add('favoritar-btn');

        const alunoFavoritado = favoritosData.some(favorito => favorito.id === alunoId);

        if (alunoFavoritado) {
            favoritarButton.innerHTML = `Desfavoritar <img src="/imgs/coracao_favoritar.png" alt="Desfavoritar">`;
            favoritarButton.style.backgroundColor = 'red';
            favoritarButton.onclick = () => desfavoritar(alunoId, favoritarButton);
        } else {
            favoritarButton.innerHTML = `Favoritar <img src="../imgs/coracao_favoritar.png" alt="Favoritar">`;
            favoritarButton.onclick = () => favoritar(alunoId, favoritarButton);
        }

        blocoInfoAluno.appendChild(favoritarButton);

        // Configura o botão "Tenho Interesse"
        const interesseButton = document.createElement('button');
        interesseButton.innerText = 'Tenho Interesse';
        interesseButton.onclick = () => tenhoInteresse(alunoId, interesseButton, nomeAluno);

        containerBotaoInteresse.innerHTML = ''; // Limpa qualquer conteúdo anterior
        containerBotaoInteresse.appendChild(interesseButton);

        document.querySelector('.container_ver_mais').style.display = 'block';

    } catch (error) {
        console.error('Erro ao buscar os detalhes do aluno:', error);
    }
}

async function favoritar(alunoId, favoritarButton) {
    const idUsuarioLogado = getIdUsuarioLogado(); // Supondo que você tenha uma função para obter o ID do usuário logado
    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuarioLogado}/favoritos/${alunoId}`, {
            method: 'POST'
        });

        if (response.ok) {
            favoritarButton.innerHTML = `Desfavoritar <img src="/imgs/coracao_favoritar.png" alt="Desfavoritar">`;
            favoritarButton.style.backgroundColor = 'red';
            favoritarButton.classList.add('favoritado');
            favoritarButton.onclick = () => desfavoritar(alunoId, favoritarButton);
        } else {
            alert('Falha ao favoritar o aluno.');
        }
    } catch (error) {
        console.error('Erro ao favoritar o aluno:', error);
    }
}

async function desfavoritar(alunoId, favoritarButton) {
    const idUsuarioLogado = getIdUsuarioLogado(); // Supondo que você tenha uma função para obter o ID do usuário logado
    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuarioLogado}/favoritos/${alunoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Atualiza o botão para "Favoritar"
            favoritarButton.innerHTML = `Favoritar <img src="../imgs/coracao_favoritar.png" alt="Favoritar">`;
            favoritarButton.classList.remove('favoritado'); // Remove a classe vermelha
            favoritarButton.style.backgroundColor = '#244aa5';
            favoritarButton.onclick = () => favoritar(alunoId, favoritarButton);
        } else {
            alert('Falha ao desfavoritar o aluno.');
        }
    } catch (error) {
        console.error('Erro ao desfavoritar o aluno:', error);
    }
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;
}

function getIdUsuarioLogado() {
    const data = JSON.parse(sessionStorage.getItem('user'))

    console.log(data)
    return data.id;
}

function fecharVerMais() {
    document.querySelector('.container_ver_mais').style.display = 'none';
}

async function tenhoInteresse(alunoId, interesseButton, nomeAluno) {
    const idUsuarioLogado = getIdUsuarioLogado(); // Função que obtém o ID do usuário logado
    try {
        const response = await fetch(`http://localhost:8080/dashboardRecrutador/${idUsuarioLogado}/interessados/${alunoId}`, {
            method: 'POST'
        });

        if (response.ok) {
            // Chama a função fecharVerMais() para ocultar a seção atual
            fecharVerMais();

            // Exibe a notificação de interesse
            const containerInteresse = document.querySelector(".container_interesse");
            const nomeAlunoSpan = document.querySelector(".nome_do_aluno_mensagem");

            // Verifica se os elementos foram encontrados no DOM
            if (containerInteresse && nomeAlunoSpan) {
                // Verifica se nomeAluno não está undefined
                if (nomeAluno) {
                    nomeAlunoSpan.textContent = nomeAluno; // Atualiza o nome do aluno na mensagem
                    containerInteresse.style.display = 'block'; // Exibe a div de interesse
                } else {
                    console.error('Erro: nomeAluno está undefined');
                }
            } else {
                console.error('Erro: elementos de notificação não encontrados no DOM');
            }
        } else {
            alert('Falha ao marcar interesse.');
        }
    } catch (error) {
        console.error('Erro ao marcar interesse no aluno:', error);
    }
}

function fecharNotificacao() {
    document.querySelector('.container_interesse').style.display = 'none';
    location.reload();
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('http://localhost:8080/usuarios/listar');
        const data = await response.json();

        const municipioSelect = document.getElementById('municipio');

        municipioSelect.innerHTML = '<option value="opc_municipio">Cidade</option>';

        const cidades = new Set();

        data.forEach(usuario => {
            if (usuario.tipoUsuario === "Aluno" && usuario.endereco) {
                cidades.add(usuario.endereco.cidade);
            }
        });

        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.toLowerCase().replace(/\s+/g, '_'); 
            option.textContent = cidade; 
            municipioSelect.appendChild(option); 
        });
    } catch (error) {
        console.error('Erro ao carregar os dados dos usuários:', error);
    }
});
