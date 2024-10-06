document.addEventListener('DOMContentLoaded', function () {
    renderizarGraficos();
});

async function buscarDados() {
    try {
        const resposta = await fetch('http://localhost:8080/dashboardAdm/demografia-alunos?tipoLista=contratados');
        if (!resposta.ok) {
            throw new Error('Erro ao buscar os dados');
        }
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.error('Erro:', erro);
        return null;
    }
}

function criarGraficoRosca(ctx, rotulos, dados, titulo) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: rotulos,
            datasets: [{
                label: titulo,
                data: dados,
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}

function criarGraficoBarras(ctx, rotulos, dados, titulo, cores) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rotulos,
            datasets: [{
                label: titulo,
                data: dados,
                backgroundColor: cores
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}

function gerarCores(quantidade) {
    const cores = [];
    for (let i = 0; i < quantidade; i++) {
        cores.push(`hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`);
    }
    return cores;
}

async function renderizarGraficos() {
    const dadosRecebidos = await buscarDados();

    if (dadosRecebidos) {
        const rotulosSexo = Object.keys(dadosRecebidos.sexo);
        const dadosSexo = Object.values(dadosRecebidos.sexo);
        const ctxSexo = document.getElementById('distribuicaoPorSexoListas').getContext('2d');
        criarGraficoRosca(ctxSexo, rotulosSexo, dadosSexo, 'Distribuição por Sexo');

        const rotulosEtnia = Object.keys(dadosRecebidos.etnia);
        const dadosEtnia = Object.values(dadosRecebidos.etnia);
        const ctxEtnia = document.getElementById('distribuicaoPorEtniaListas').getContext('2d');
        criarGraficoRosca(ctxEtnia, rotulosEtnia, dadosEtnia, 'Distribuição por Etnia');

        const rotulosEscolaridade = Object.keys(dadosRecebidos.escolaridade);
        const dadosEscolaridade = Object.values(dadosRecebidos.escolaridade);
        const ctxEscolaridade = document.getElementById('distribuicaoPorEscolaridadeListas').getContext('2d');
        criarGraficoRosca(ctxEscolaridade, rotulosEscolaridade, dadosEscolaridade, 'Distribuição por Escolaridade');

        const rotulosCidade = Object.keys(dadosRecebidos.cidade);
        const dadosCidade = Object.values(dadosRecebidos.cidade);
        const ctxCidade = document.getElementById('alunosPorCidade').getContext('2d');
        const coresCidade = gerarCores(rotulosCidade.length);
        criarGraficoBarras(ctxCidade, rotulosCidade, dadosCidade, 'Distribuição por Cidade', coresCidade);

        const rotulosCursos = Object.keys(dadosRecebidos.cursosFeitos);
        const dadosCursos = Object.values(dadosRecebidos.cursosFeitos);
        const ctxCursos = document.getElementById('CursosLista').getContext('2d');
        const coresCursos = gerarCores(rotulosCursos.length);
        criarGraficoBarras(ctxCursos, rotulosCursos, dadosCursos, 'Distribuição de Cursos Feitos', coresCursos);
    } else {
        console.error('Nenhum dado encontrado!');
    }
}
