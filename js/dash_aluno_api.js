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

            // Salvando cursos no sessionStorage
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

            // Fetch pontos da semana
            const pontosSemanaResponse = await fetch(`http://localhost:8080/grafico/pontosDaSemana/${user.idUsuario}`);
            if (!pontosSemanaResponse.ok) {
                throw new Error('Erro ao buscar pontos da semana');
            }
            const pontosSemanaData = await pontosSemanaResponse.json();

            document.getElementById('pontos-semana').innerText = `${pontosSemanaData.pontosSemanaAtual} pts`;

            const semanaPassadaChangeElement = document.getElementById('semana-passada-change');
            semanaPassadaChangeElement.innerText = `${pontosSemanaData.diferencaPontos >= 0 ? '+' : '-'} ⬆ ${pontosSemanaData.diferencaPontos} pts`;
            semanaPassadaChangeElement.classList.toggle('green', pontosSemanaData.diferencaPontos >= 0);
            semanaPassadaChangeElement.classList.toggle('red', pontosSemanaData.diferencaPontos < 0);
            
            // Fetch pontos para grafico de linha
            const graficoLinhaResponse = await fetch(`http://localhost:8080/grafico/pontosAoLongoDoTempo/${user.idUsuario}`);
            if (!graficoLinhaResponse.ok) {
                throw new Error('Erro ao buscar dados dos pontos');
            }
            const graficoLinhaData = await graficoLinhaResponse.json();

            const cursosGraficoLinha = {};
            graficoLinhaData.forEach(entry => {
                const date = new Date(entry.data_pontuacao).toLocaleDateString();
                if (!cursosGraficoLinha[entry.nome]) {
                    cursosGraficoLinha[entry.nome] = {};
                }
                cursosGraficoLinha[entry.nome][date] = entry.pontos;
            });

            const labelsLinha = Array.from(new Set(graficoLinhaData.map(entry => new Date(entry.data_pontuacao).toLocaleDateString()))).sort();
            const datasetsLinha = Object.keys(cursosGraficoLinha).map(curso => {
                const color = getRandomColor();
                return {
                    label: curso,
                    data: labelsLinha.map(label => cursosGraficoLinha[curso][label] || 0),
                    fill: false,
                    borderColor: color,
                    backgroundColor: color
                };
            });

            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            // Gráfico de linha
            const ctxLinha = document.getElementById('pontosLinhaChart').getContext('2d');
            const myChartLinha = new Chart(ctxLinha, {
                type: 'line',
                data: {
                    labels: labelsLinha,
                    datasets: datasetsLinha
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: false,
                            text: 'Pontos ao Longo do Tempo por Curso'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Data'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Pontos'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

            // Fetch pontos por mês
            const pontosResponse = await fetch(`http://localhost:8080/grafico/pontosPorCursoAoMes/${user.idUsuario}`);
            if (!pontosResponse.ok) {
                throw new Error('Erro ao buscar dados dos pontos por mês');
            }
            const pontosData = await pontosResponse.json();

            // Cria um dropdown para selecionar o curso
            const cursoSelect = document.getElementById('cursoSelect');
            const cursosUnicos = JSON.parse(sessionStorage.getItem('cursos'));
            cursosUnicos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso;
                option.text = curso;
                cursoSelect.add(option);
            });

            cursoSelect.addEventListener('change', () => {
                const selectedCurso = cursoSelect.value;
                updateBarChart(selectedCurso);
            });

            // atualiza o gráfico de barras
            function updateBarChart(cursoSelecionado) {
                const filteredData = pontosData.filter(p => p.nome === cursoSelecionado);
                const meses = [1, 2, 3, 4, 5, 6];
                const data = meses.map(mes => {
                    const mesData = filteredData.find(p => p.mes === mes);
                    return mesData ? mesData.pontos : 0;
                });

                myChartBarra.data.labels = meses.map(mes => mes + '/' + new Date().getFullYear());
                myChartBarra.data.datasets[0].data = data;
                myChartBarra.data.datasets[0].label = cursoSelecionado;
                myChartBarra.update();
            }

            function getRandomColorBarras() {
                const cor = Math.floor(Math.random() * 360);
                const pastel = 'hsl(' + cor + ', 100%, 80%)';
                return pastel;
            }
            
            const ctxBarra = document.getElementById('pontosBarraChart').getContext('2d');
            const myChartBarra = new Chart(ctxBarra, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: '',
                        data: [],
                        backgroundColor: 'hsl(219, 100%, 80%)',
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Pontos por Mês por Curso'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Mês'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Pontos'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

            if (cursosUnicos.length > 0) {
                cursoSelect.value = cursosUnicos[0];
                updateBarChart(cursosUnicos[0]);
            }

            // Fetch pontos por curso
            const pontosPorCursoResponse = await fetch(`http://localhost:8080/grafico/pontos-por-curso?idUsuario=${user.idUsuario}`);
            if (!pontosPorCursoResponse.ok) {
                throw new Error('Erro ao buscar dados dos pontos por curso');
            }
            const pontosPorCursoData = await pontosPorCursoResponse.json();

            const courseSelect = document.getElementById('course-select');
            pontosPorCursoData.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.idCurso;
                option.text = curso.nomeCurso;
                courseSelect.add(option);
            });

            // Atualizar medalha quando o curso selecionado mudar
            courseSelect.addEventListener('change', () => {
                const selectedCurso = courseSelect.value;
                const curso = pontosPorCursoData.find(c => c.idCurso == selectedCurso);
                updateMedalha(curso);
            });

            function updateMedalha(curso) {
                let nivel = '';
                let medalhaSrc = '';

                if (curso.totalPontos > 4000) {
                    nivel = 'Ouro';
                    medalhaSrc = '../imgs/gold medal.png';
                } else if (curso.totalPontos > 2000) {
                    nivel = 'Prata';
                    medalhaSrc = '../imgs/silver medal.png';
                } else {
                    nivel = 'Bronze';
                    medalhaSrc = '../imgs/bronze medal.png';
                }

                document.getElementById('medalha-curso').src = medalhaSrc;
                document.getElementById('medalha-curso').alt = nivel;
            }

            // Atualizar a medalha inicialmente com o primeiro curso
            if (pontosPorCursoData.length > 0) {
                updateMedalha(pontosPorCursoData[0]);
            }
          
            let topCurso = null;
            pontosPorCursoData.forEach(curso => {
                if (!topCurso || curso.totalPontos > topCurso.totalPontos) {
                    topCurso = curso;
                }
            });

            let nivel = '';
            if (topCurso.totalPontos > 4000) {
                nivel = 'Ouro';
            } else if (topCurso.totalPontos > 2000) {
                nivel = 'Prata';
            } else {
                nivel = 'Bronze';
            }
            
            document.getElementById('nomeCurso').innerHTML = topCurso.nomeCurso;
            document.getElementById('nivel').innerHTML = "Nível " + nivel;
            if (nivel === 'Ouro') {
                document.getElementById('nivel').classList.add('gold-text');
            } else if (nivel === 'Prata') {
                document.getElementById('nivel').classList.add('silver-text');
            } else {
                document.getElementById('nivel').classList.add('bronze-text');
            }

        } catch (error) {
            console.error('Erro:', error);
        }
    } else {
        window.location.href = '/login.html';
    }
});
