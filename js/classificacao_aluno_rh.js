document.addEventListener('DOMContentLoaded', function () {
    const filtroCursos = document.getElementById('courseFilter');
    const tabelaRanking = document.getElementById('rankingTable');

    buscarEExibirRanking();
    popularFiltroCursos();
    
    function buscarEExibirRanking() {
        fetch('http://localhost:8080/pontuacoes/ranking')
            .then(response => response.json())
            .then(dados => {

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

                // Limpe a tabela atual
                tabelaRanking.innerHTML = '';

  
                arrayRanking.forEach((entrada, index) => {
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>${index + 1}</td>
                        <td>
                            <img src="http://localhost:8080/usuarios/imagem/${entrada.id}" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;">
                            ${entrada.nome}<br>
                            <small>${entrada.email}</small>
                        </td>
                        <td>${entrada.pontosTotais}</td>
                    `;
                    tabelaRanking.appendChild(linha);
                });
            })
            .catch(error => console.error('Erro ao buscar o ranking:', error));
    }


    function popularFiltroCursos() {
        fetch('http://localhost:8080/pontuacoes/ranking')
            .then(response => response.json())
            .then(dados => {
                const cursos = Object.values(dados).map(curso => curso.nomeCurso);
                const cursosUnicos = [...new Set(cursos)]; // Remove cursos duplicados

                filtroCursos.innerHTML = '<option value="all">Cursos</option>';
                cursosUnicos.forEach(curso => {
                    const opcao = document.createElement('option');
                    opcao.value = curso;
                    opcao.textContent = curso;
                    filtroCursos.appendChild(opcao);
                });
            })
            .catch(error => console.error('Erro ao buscar os cursos:', error));
    }


    filtroCursos.addEventListener('change', function () {
        if (this.value === 'all') {
            buscarEExibirRanking();
        } else {
            fetch('http://localhost:8080/pontuacoes/ranking')
                .then(response => response.json())
                .then(dados => {
                    const dadosCurso = Object.values(dados).find(curso => curso.nomeCurso === this.value);
                    if (dadosCurso) {
                        const dadosRanking = dadosCurso.ranking || [];
                        tabelaRanking.innerHTML = '';

                        dadosRanking.forEach((entrada, index) => {
                            const linha = document.createElement('tr');
                            linha.innerHTML = `
                                <td>${index + 1}</td>
                                <td>
                                    <img src="http://localhost:8080/usuarios/imagem/${entrada.aluno.id}" alt="Imagem de perfil" class="img-thumbnail" style="width: 50px;">
                                    ${entrada.aluno.primeiroNome} ${entrada.aluno.sobrenome}<br>
                                    <small>${entrada.aluno.email}</small>
                                </td>
                                <td>${entrada.pontosTotais}</td>
                            `;
                            tabelaRanking.appendChild(linha);
                        });
                    }
                })
                .catch(error => console.error('Erro ao buscar o ranking por curso:', error));
        }
    });
});

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