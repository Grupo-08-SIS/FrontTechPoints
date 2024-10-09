import { obterMedalha } from './medalhas.js';
window.fazerLogout = fazerLogout

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
        
                const arrayRanking = Object.values(pontosTotais).sort((a, b) => b.pontosTotais - a.pontosTotais);
        
                tabelaRanking.innerHTML = '';
        
                arrayRanking.forEach((entrada, index) => {
                    const medalha = obterMedalha(entrada.pontosTotais); 
        
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>
                            <img src="" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;" id="img-${entrada.id}">
                            ${entrada.nome}<br>
                            <small>${entrada.email}</small>
                        </td>
                        <td>
                            <img src="/imgs/${medalha}" alt="${entrada.pontosTotais} pontos" style="width: 40px; height: 40px;">
                        </td>
                    `;
                    tabelaRanking.appendChild(linha);
        
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

        async function popularFiltroCursos() {
            try {
                const response = await fetch('http://localhost:8080/pontuacoes/ranking');
                if (!response.ok) throw new Error('Falha ao buscar os cursos.');

                const dados = await response.json();
                const cursos = Object.values(dados).map(curso => curso.nomeCurso);
                const cursosUnicos = [...new Set(cursos)];

                filtroCursos.innerHTML = '<option value="all">Cursos</option>';
                cursosUnicos.forEach(curso => {
                    const opcao = document.createElement('option');
                    opcao.value = curso;
                    opcao.textContent = curso;
                    filtroCursos.appendChild(opcao);
                });
            } catch (error) {
                console.error('Erro ao buscar os cursos:', error);
            }
        }

        filtroCursos.addEventListener('change', async function () {
            try {
                if (this.value === 'all') {
                    await buscarEExibirRanking();
                } else {
                    const response = await fetch('http://localhost:8080/pontuacoes/ranking');
                    if (!response.ok) throw new Error('Falha ao buscar o ranking por curso.');
        
                    const dados = await response.json();
                    const dadosCurso = Object.values(dados).find(curso => curso.nomeCurso === this.value);
                    if (dadosCurso) {
                        const dadosRanking = dadosCurso.ranking || [];
                        tabelaRanking.innerHTML = '';
        
                        dadosRanking.forEach((entrada, index) => {
                            const medalha = obterMedalha(entrada.pontosTotais); // Função para obter a medalha
        
                            const linha = document.createElement('tr');
                            linha.innerHTML = `
                                <td>
                                    <img src="" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;" id="img-${entrada.aluno.id}">
                                    ${entrada.aluno.primeiroNome} ${entrada.aluno.sobrenome}<br>
                                    <small>${entrada.aluno.email}</small>
                                </td>
                                <td>
                                    <img src="/imgs/${medalha}" alt="${entrada.pontosTotais} pontos" style="width: 40px; height: 40px;">
                                </td>
                            `;
                            tabelaRanking.appendChild(linha);
        
                            carregarImagemPerfil(entrada.aluno.id);
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar o ranking por curso:', error);
            }
        });        

        buscarEExibirRanking();
        popularFiltroCursos();
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
