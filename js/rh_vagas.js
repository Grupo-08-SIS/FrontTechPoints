document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:8080/pontuacoes/alunos');
        const data = await response.json();

        // Selecionar o contêiner de cursos
        const containerCursos = document.getElementById('cursos_container');
        
        if (!containerCursos) {
            console.error('Contêiner de cursos não encontrado.');
            return;
        }

        // Obter IDs dos cursos e embaralhar
        const cursoIds = Object.keys(data);
        const cursosEmbaralhados = shuffleArray(cursoIds);

        // Iterar sobre todos os cursos embaralhados
        for (let i = 0; i < cursosEmbaralhados.length; i++) {
            const cursoId = cursosEmbaralhados[i];
            const curso = data[cursoId];

            // Criar o HTML para o curso e alunos
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

            // Adicionar a div do curso ao contêiner de cursos
            containerCursos.appendChild(cursoDiv);

            // Obter a lista de alunos para este curso
            let alunos = curso.ranking;
            alunos = shuffleArray(alunos);

            // Selecionar o bloco de alunos correspondente
            const blocoAlunos = document.getElementById(`bloco_alunos_${cursoId}`);

            // Exibir no máximo 3 alunos
            const maxAlunos = 3;
            alunos.slice(0, maxAlunos).forEach(aluno => {
                const alunoDiv = document.createElement('div');
                alunoDiv.className = 'box_Aluno';

                // Determinar o tipo de medalha
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

            // Adicionar a div de espaçamento, exceto no último curso
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

function verMais(alunoId) {
    // Função para mostrar mais detalhes do aluno
    console.log('Ver mais detalhes para o aluno com ID:', alunoId);
}

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // Enquanto houver elementos para embaralhar
    while (currentIndex !== 0) {

        // Escolhe um elemento restante
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Troca o elemento atual com o elemento escolhido
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}
