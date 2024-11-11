import { obterMedalha } from './medalhas.js';
window.fazerLogout = fazerLogout;

document.addEventListener('DOMContentLoaded', function () {
    const filtroCursos = document.getElementById('courseFilter');
    const tabelaRanking = document.getElementById('rankingTable');

    if (filtroCursos && tabelaRanking) {
        async function buscarEExibirRanking() {
            try {
                const response = await fetch('http://localhost:8080/pontuacoes/ranking');
                if (!response.ok) throw new Error('Falha ao buscar o ranking.');

                const dados = await response.json();
                const pontosTotais = {};

                Object.values(dados).forEach(dadosCurso => {
                    dadosCurso.ranking.forEach(entrada => {
                        const aluno = entrada.aluno;
                        if (!pontosTotais[aluno.id]) {
                            pontosTotais[aluno.id] = {
                                id: aluno.id,
                                nome: `${aluno.primeiroNome} ${aluno.sobrenome}`,
                                email: aluno.email,
                                pontosTotais: 0
                            };
                        }
                        pontosTotais[aluno.id].pontosTotais += entrada.pontosTotais;
                    });
                });

                // Ordenando alunos pelo total de pontos
                const arrayRanking = Object.values(pontosTotais).sort((a, b) => b.pontosTotais - a.pontosTotais);

                // Limpando o conteúdo atual da tabela de ranking
                tabelaRanking.innerHTML = '';

                arrayRanking.forEach((entrada, index) => {
                    let medalhaHtml = '';

                    // Definindo a medalha para os 3 primeiros lugares
                    if (index === 0) {
                        medalhaHtml = '<img src="/imgs/gold_medal.png" alt="Medalha de Ouro" style="width: 40px; height: 40px;">';
                    } else if (index === 1) {
                        medalhaHtml = '<img src="/imgs/silver_medal.png" alt="Medalha de Prata" style="width: 40px; height: 40px;">';
                    } else if (index === 2) {
                        medalhaHtml = '<img src="/imgs/bronze_medal.png" alt="Medalha de Bronze" style="width: 40px; height: 40px;">';
                    } else {
                        // Alunos sem medalha mostram apenas a posição numérica
                        medalhaHtml = `<span>${index + 1}º</span>`;
                    }

                    // Criando a linha de tabela para cada aluno
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>${medalhaHtml}</td>
                        <td style="text-align: right;">
                            <img src="" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;" id="img-${entrada.id}">
                        </td>
                        <td>
                            <span style="font-weight: 800;">${entrada.nome}</span> <br>
                            <small style="font-weight: 200;">${entrada.email}</small>
                        </td>
                        <td>
                            ${entrada.pontosTotais} 
                        </td>
                    `;
                    tabelaRanking.appendChild(linha);

                    // Carregar imagem de perfil do aluno
                    carregarImagemPerfil(entrada.id);
                });
            } catch (error) {
                console.error('Erro ao buscar o ranking:', error);
            }
        }

        async function carregarImagemPerfil(id) {
            const imgElement = document.getElementById(`img-${id}`);
            if (!imgElement) return;

            try {
                const response = await fetch(`http://localhost:8080/usuarios/imagem/${id}`);
                if (response.ok) {
                    const imageBlob = await response.blob();
                    if (imageBlob.size > 0) {
                        const imageUrl = URL.createObjectURL(imageBlob);
                        imgElement.src = imageUrl;
                    } else {
                        imgElement.src = '/imgs/foto_padrao.png';
                    }
                } else {
                    imgElement.src = '/imgs/foto_padrao.png';
                }
            } catch (error) {
                console.error('Erro ao buscar a imagem do perfil:', error);
                imgElement.src = '/imgs/foto_padrao.png';
            }

            imgElement.style.width = '50px';
            imgElement.style.height = '50px';
            imgElement.style.borderRadius = '100%';
            imgElement.style.objectFit = 'cover';
        }

        async function popularFiltroCategorias() {
            try {
                const response = await fetch('http://localhost:8080/dashboardRecrutador/listar');
                if (!response.ok) throw new Error('Falha ao buscar as categorias dos cursos.');

                const dados = await response.json();
                const categoriasSet = new Set();

                dados.forEach(curso => {
                    curso.categoria.forEach(cat => categoriasSet.add(cat));
                });

                filtroCursos.innerHTML = '<option value="all">Categorias</option>';

                categoriasSet.forEach(categoria => {
                    const opcao = document.createElement('option');
                    opcao.value = categoria;
                    opcao.textContent = categoria;
                    filtroCursos.appendChild(opcao);
                });
            } catch (error) {
                console.error('Erro ao carregar as categorias:', error);
            }
        }

        async function carregarCursosPorCategoria(categoria) {
            try {
                const response = await fetch(`http://localhost:8080/dashboardRecrutador/listar?categoria=${categoria}`);
                if (!response.ok) throw new Error('Falha ao buscar cursos da categoria selecionada.');

                const cursos = await response.json();

                // Remover duplicatas de categorias dentro dos cursos
                cursos.forEach(curso => {
                    curso.categoria = [...new Set(curso.categoria)]; // Remove categorias duplicadas
                });

                // Salvando cursos no sessionStorage com categorias únicas
                sessionStorage.setItem(`cursos_${categoria}`, JSON.stringify(cursos));

                // Atualizando o filtro de cursos
                const filtroCurso = document.getElementById('filtroCurso');
                filtroCurso.innerHTML = '<option value="all">Selecione um curso</option>';

                cursos.forEach(curso => {
                    const opcao = document.createElement('option');
                    opcao.value = curso.id;
                    opcao.textContent = curso.nome;
                    filtroCurso.appendChild(opcao);
                });
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
            }
        }

        filtroCursos.addEventListener('change', function () {
            const categoriaSelecionada = this.value;
            const filtroCurso = document.getElementById('filtroCurso');
            const cursoClass = document.querySelectorAll('.course-select')[1];

            if (categoriaSelecionada !== 'all') {
                cursoClass.style.display = 'block';

                filtroCurso.innerHTML = '<option value="all">Cursos</option>';

                carregarCursosPorCategoria(categoriaSelecionada);
            } else {
                filtroCurso.innerHTML = '<option value="all">Selecione uma categoria primeiro</option>';

                cursoClass.style.display = 'none';
            }
        });

        document.getElementById('courseFilter').addEventListener('change', async function () {
            try {
                const categoriaSelecionadaNome = this.options[this.selectedIndex].text.trim().toLowerCase();
        
                // Se a categoria selecionada for "Categoria", mostra o ranking geral
                if (categoriaSelecionadaNome === 'Categoria') {
                    await buscarEExibirRanking();
                    return;
                }
        
                // Verifica se há cursos para a categoria selecionada no sessionStorage
                const chaveCategoria = `cursos_${categoriaSelecionadaNome.charAt(0).toUpperCase() + categoriaSelecionadaNome.slice(1)}`;  // Exemplo: cursos_Tecnologia
                const cursosDaCategoria = JSON.parse(sessionStorage.getItem(chaveCategoria));
        
                // Se não houver cursos para a categoria selecionada
                if (!cursosDaCategoria || cursosDaCategoria.length === 0) {
                    console.log(`Nenhum curso encontrado para a categoria: ${categoriaSelecionadaNome}`);
                    return;
                }
        
                // Exibe os cursos dessa categoria
                console.log(`Cursos da categoria ${categoriaSelecionadaNome}:`, cursosDaCategoria);
        
                // Busca o ranking para cada curso da categoria
                const responseRanking = await fetch('http://localhost:8080/pontuacoes/ranking');
                if (!responseRanking.ok) throw new Error('Falha ao buscar o ranking dos cursos.');
        
                const dadosRanking = await responseRanking.json();
        
                tabelaRanking.innerHTML = ''; // Limpa a tabela de ranking antes de exibir os dados
        
                // Itera pelos cursos da categoria armazenada no sessionStorage
                cursosDaCategoria.forEach((curso) => {
                    // Encontra o ranking do curso dentro dos dados de ranking
                    const dadosCurso = Object.values(dadosRanking).find(rankingCurso =>
                        rankingCurso.nomeCurso.trim().toLowerCase() === curso.nome.trim().toLowerCase()
                    );
        
                    if (dadosCurso && dadosCurso.ranking && dadosCurso.ranking.length > 0) {
                        dadosCurso.ranking.forEach((entrada, index) => {
                            let medalhaHtml = '';
        
                            // Definindo a medalha para os 3 primeiros lugares
                            if (index === 0) {
                                medalhaHtml = '<img src="/imgs/gold_medal.png" alt="Medalha de Ouro" style="width: 40px; height: 40px;">';
                            } else if (index === 1) {
                                medalhaHtml = '<img src="/imgs/silver_medal.png" alt="Medalha de Prata" style="width: 40px; height: 40px;">';
                            } else if (index === 2) {
                                medalhaHtml = '<img src="/imgs/bronze_medal.png" alt="Medalha de Bronze" style="width: 40px; height: 40px;">';
                            } else {
                                // Alunos sem medalha mostram apenas a posição numérica
                                medalhaHtml = `<span>${index + 1}º</span>`;
                            }
        
                            // Criando a linha de tabela para cada aluno
                            const linha = document.createElement('tr');
                            linha.innerHTML = `
                                <td>${medalhaHtml}</td>
                                <td style="text-align: right;">
                                    <img src="" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;" id="img-${entrada.aluno.id}">
                                </td>
                                <td>
                                    <span style="font-weight: 800;">${entrada.aluno.primeiroNome} ${entrada.aluno.sobrenome}</span> <br>
                                    <small style="font-weight: 200;">${entrada.aluno.email}</small>
                                </td>
                                <td>
                                    ${entrada.pontosTotais}
                                </td>
                            `;
                            tabelaRanking.appendChild(linha);
        
                            // Carregar a imagem de perfil do aluno
                            carregarImagemPerfil(entrada.aluno.id);
                        });
                    }
                });
            } catch (error) {
                console.error('Erro ao buscar os dados:', error);
            }
        });        

        document.getElementById('filtroCurso').addEventListener('change', async function () {
            try {
                const cursoSelecionadoNome = this.options[this.selectedIndex].text.trim().toLowerCase();

                if (cursoSelecionadoNome === 'selecione um curso') {
                    await buscarEExibirRanking();
                } else {
                    const response = await fetch('http://localhost:8080/pontuacoes/ranking');
                    if (!response.ok) throw new Error('Falha ao buscar o ranking por curso.');

                    const dados = await response.json();

                    const dadosCurso = Object.values(dados).find(curso =>
                        curso.nomeCurso.trim().toLowerCase() === cursoSelecionadoNome
                    );

                    if (dadosCurso && dadosCurso.ranking && dadosCurso.ranking.length > 0) {
                        tabelaRanking.innerHTML = '';

                        dadosCurso.ranking.forEach((entrada, index) => {
                            let medalhaHtml = '';

                            // Definindo a medalha para os 3 primeiros lugares
                            if (index === 0) {
                                medalhaHtml = '<img src="/imgs/gold_medal.png" alt="Medalha de Ouro" style="width: 40px; height: 40px;">';
                            } else if (index === 1) {
                                medalhaHtml = '<img src="/imgs/silver_medal.png" alt="Medalha de Prata" style="width: 40px; height: 40px;">';
                            } else if (index === 2) {
                                medalhaHtml = '<img src="/imgs/bronze_medal.png" alt="Medalha de Bronze" style="width: 40px; height: 40px;">';
                            } else {
                                // Alunos sem medalha mostram apenas a posição numérica
                                medalhaHtml = `<span>${index + 1}º</span>`;
                            }

                            // Criando a linha de tabela para cada aluno
                            const linha = document.createElement('tr');
                            linha.innerHTML = `
                                <td>${medalhaHtml}</td>
                                <td style="text-align: right;">
                                    <img src="" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;" id="img-${entrada.aluno.id}">
                                </td>
                                <td>
                                    <span style="font-weight: 800;">${entrada.aluno.primeiroNome} ${entrada.aluno.sobrenome}</span> <br>
                                    <small style="font-weight: 200;">${entrada.aluno.email}</small>
                                </td>
                                <td>
                                    ${entrada.pontosTotais}
                                </td>
                            `;
                            tabelaRanking.appendChild(linha);

                            carregarImagemPerfil(entrada.aluno.id);
                        });
                    } else {
                        console.log('Nenhum ranking encontrado para o curso selecionado.');
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar o ranking por curso:', error);
            }
        });

        buscarEExibirRanking();
        popularFiltroCategorias();
    } else {
        console.error('Elementos necessários não encontrados.');
    }
});


async function fazerLogout() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    try {
        const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.id}`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Erro ao fazer logoff.');

        sessionStorage.clear();
        window.location.href = '/html/home.html';
    } catch (error) {
        console.error('Erro ao fazer logoff:', error);
        alert('Erro ao fazer logoff. Por favor, tente novamente.');
    }
}
