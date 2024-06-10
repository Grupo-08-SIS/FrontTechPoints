document.addEventListener('DOMContentLoaded', async function() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.idUsuario) {
        try {
            // Fetch atividades do usuario
            const atividadesResponse = await fetch(`http://localhost:8080/grafico/atividadesDoUsuario/${user.idUsuario}`);
            if (!atividadesResponse.ok) {
                throw new Error('Erro ao buscar dados das atividades');
            }
            const atividadesData = await atividadesResponse.json();

            let totalAtividades = 0;
            let atividadesFeitas = 0;
            let cursos = [];

            atividadesData.forEach(curso => {
                totalAtividades += curso.totalQtdAtividades;
                atividadesFeitas += curso.totalAtividadesUsuario;
                cursos.push(curso.nomeCurso);
            });

            sessionStorage.setItem('cursos', JSON.stringify(cursos));

            const porcentagemFeitas = ((atividadesFeitas / totalAtividades) * 100).toFixed(2);
            document.getElementById('atividades-entregues').innerText = `${porcentagemFeitas}%`;

            const atividadesChangeElement = document.getElementById('atividades-entregues-change');
            if (porcentagemFeitas >= 50) {
                atividadesChangeElement.classList.remove('red');
                atividadesChangeElement.classList.add('green');
                atividadesChangeElement.innerText = '⬆';
            } else {
                atividadesChangeElement.classList.remove('green');
                atividadesChangeElement.classList.add('red');
                atividadesChangeElement.innerText = '⬇';
            }

            // Fetch pontos ao longo do tempo
            const graficoLinhaResponse = await fetch(`http://localhost:8080/grafico/pontosAoLongoDoTempo/${user.idUsuario}`);
            if (!graficoLinhaResponse.ok) {
                throw new Error('Erro ao buscar dados dos pontos');
            }
            const graficoLinhaData = await graficoLinhaResponse.json();

            // Processando os dados para o Chart.js
            const cursosGraficoLinha = {};
            graficoLinhaData.forEach(entry => {
                const date = new Date(entry.data_pontuacao).toLocaleDateString();
                if (!cursosGraficoLinha[entry.nome]) {
                    cursosGraficoLinha[entry.nome] = {};
                }
                cursosGraficoLinha[entry.nome][date] = entry.pontos;
            });

            const labels = Array.from(new Set(graficoLinhaData.map(entry => new Date(entry.data_pontuacao).toLocaleDateString()))).sort();
            const datasets = Object.keys(cursosGraficoLinha).map(curso => {
                return {
                    label: curso,
                    data: labels.map(label => cursosGraficoLinha[curso][label] || 0),
                    fill: false,
                    borderColor: getRandomColor()
                };
            });

            // Função para gerar cores aleatórias
            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            // Configurando o gráfico com Chart.js
            const ctx = document.getElementById('pontosChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Pontos ao Longo do Tempo por Curso'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Data'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Pontos'
                            }
                        }]
                    }
                }
            });

            // Fetch pontos da semana
            const pontosSemanaResponse = await fetch(`http://localhost:8080/grafico/pontosDaSemana/${user.idUsuario}`);
            if (!pontosSemanaResponse.ok) {
            throw new Error('Erro ao buscar dados dos pontos da semana');
            }
            const pontosSemanaData = await pontosSemanaResponse.json();

            document.getElementById('pontos-semana').innerText = `${pontosSemanaData.pontosSemanaAtual}`;
            document.getElementById('semana-passada-change').innerText = `${pontosSemanaData.diferencaPontos}`;



        } catch (error) {
            console.error('Erro:', error);
        }
    } else {
        window.location.href = '/login.html';
    }
});
