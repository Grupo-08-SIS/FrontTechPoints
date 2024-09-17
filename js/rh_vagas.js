document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:8080/pontuacoes/alunos');
        const data = await response.json();

        const containerCursos = document.getElementById('cursos_container');
        
        if (!containerCursos) {
            console.error('Contêiner de cursos não encontrado.');
            return;
        }

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

            const maxAlunos = 3;
            alunos.slice(0, maxAlunos).forEach(aluno => {
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
});

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

async function verMais(alunoId) {
    try {
        const response = await fetch(`http://localhost:8080/usuarios/buscar/${alunoId}`);
        const aluno = await response.json();

        document.getElementById('nome_do_aluno').innerText = `${aluno.primeiroNome} ${aluno.sobrenome}`;

        const idade = calcularIdade(aluno.dataNascimento);
        document.getElementById('idade_do_aluno').innerText = `${idade} anos`;

        document.getElementById('municipio_do_aluno').innerText = aluno.endereco.cidade;
        document.getElementById('escolaridade_do_aluno').innerText = aluno.escolaridade;
        document.getElementById('email_do_aluno').innerText = aluno.email;
        document.getElementById('descricao_do_aluno').innerText = aluno.descricao;

        const imgElement = document.querySelector('.bloco_foto_aluno img');
        try {
            const fotoResponse = await fetch(`http://localhost:8080/usuarios/imagem/${alunoId}`);
            if (fotoResponse.ok) {
                const blob = await fotoResponse.blob();
                const fotoUrl = URL.createObjectURL(blob);
                imgElement.src = fotoUrl;
            } else {
                imgElement.src = '/imgs/foto_padrao.png';
            }
        } catch (error) {
            console.error('Erro ao buscar a foto do aluno:', error);
            imgElement.src = '/imgs/foto_padrao.png';
        }

        const emblemasResponse = await fetch(`http://localhost:8080/pontuacoes/pontos-totais/${alunoId}`);
        const emblemasData = await emblemasResponse.json();

        const emblemasContainer = document.querySelector('.container_emblemas');
        emblemasContainer.innerHTML = ''; 

        const blocoEmblemas = document.createElement('div');
        blocoEmblemas.classList.add('bloco_emblemas');

        for (const key in emblemasData) {
            const emblema = emblemasData[key];
            const pontos = emblema.pontosTotais;
            let emblemaTipo = 'bronze_medal'; // Default

            if (pontos > 600) {
                emblemaTipo = 'gold_medal';
            } else if (pontos > 500) {
                emblemaTipo = 'silver_medal';
            }

            const emblemaElement = document.createElement('div');
            emblemaElement.classList.add('box_emblemas');
            emblemaElement.innerHTML = `
                <img src="/imgs/${emblemaTipo}.png" alt="${emblema.nomeCurso}">
            `;
            blocoEmblemas.appendChild(emblemaElement);
        }

        emblemasContainer.appendChild(blocoEmblemas);

        document.querySelector('.container_ver_mais').style.display = 'block';

    } catch (error) {
        console.error('Erro ao buscar os detalhes do aluno:', error);
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


function fecharVerMais() {
    document.querySelector('.container_ver_mais').style.display = 'none';
}

