document.addEventListener('DOMContentLoaded', async function() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id) {
        console.error('Usuário não encontrado ou ID inválido.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const atividadesData = await fetchData(`http://localhost:8080/pontuacoes/kpi-entregas/${user.id}`);
        const { atividadesTotais, atividadesFeitas, porcentagemFeitas } = processAtividadesData(atividadesData);
        updateAtividadesDisplay(porcentagemFeitas);

        const pontosSemanaData = await fetchData(`http://localhost:8080/pontuacoes/kpi-semana/${user.id}`);
        updatePontosSemanaDisplay(pontosSemanaData);

        const graficoLinhaData = await fetchData(`http://localhost:8080/pontuacoes/${user.id}`);
        const { labelsLinha, datasetsLinha } = processGraficoLinhaData(graficoLinhaData);
        renderLineChart(labelsLinha, datasetsLinha);

        const pontosData = await fetchData(`http://localhost:8080/pontuacoes/pontos-mes/${user.id}`);
        const { labelsBarra, datasetsBarra } = processGraficoBarraData(pontosData);
        renderBarChart(labelsBarra, datasetsBarra);

        const pontosPorCursoData = await fetchData(`http://localhost:8080/pontuacoes/pontos-totais/${user.id}`);
        initMedalhaSelect(pontosPorCursoData);

        const topCurso = getTopCurso(pontosPorCursoData);
        updateTopCursoDisplay(topCurso);

    } catch (error) {
        console.error('Erro:', error);
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao buscar dados de ${url}`);
        return response.json();
    }

    function processAtividadesData(data) {
        const totalAtividades = data.atividadesTotais;
        const atividadesFeitas = totalAtividades - data.atividadesNaoEntregues;
        const porcentagemFeitas = ((atividadesFeitas / totalAtividades) * 100).toFixed(2);
        return { totalAtividades, atividadesFeitas, porcentagemFeitas };
    }

    function updateAtividadesDisplay(porcentagemFeitas) {
        const atividadesChangeElement = document.getElementById('atividades-entregues-change');
        document.getElementById('atividades-entregues').innerText = `${porcentagemFeitas}%`;

        if (porcentagemFeitas >= 50) {
            updateClass(atividadesChangeElement, 'green', 'red');
            atividadesChangeElement.innerText = '⬆';
        } else {
            updateClass(atividadesChangeElement, 'red', 'green');
            atividadesChangeElement.innerText = '⬇';
        }
    }

    function updatePontosSemanaDisplay(data) {
        const pontosSemanaElement = document.getElementById('pontos-semana');
        const semanaPassadaPontosElement = document.getElementById('semana-passada-pontos');
        const pontosSemanaChangeElement = document.getElementById('pontos-semana-change');

        const totalSemanaPassada = Object.values(data.semanaPassada).reduce((acc, pontos) => acc + pontos, 0);
        const totalSemanaAtual = Object.values(data.semanaAtual).reduce((acc, pontos) => acc + pontos, 0);
        const diferenca = totalSemanaAtual - totalSemanaPassada;

        pontosSemanaElement.innerText = `${totalSemanaAtual} pts`;
        semanaPassadaPontosElement.innerText = `${totalSemanaPassada} pts`;

        const diferencaSimbolo = diferenca >= 0 ? '⬆' : '⬇';
        const corClasse = diferenca >= 0 ? 'green' : 'red';

        pontosSemanaChangeElement.innerText = `${diferencaSimbolo} ${Math.abs(diferenca)} pts`;
        updateClass(pontosSemanaChangeElement, corClasse);
    }

    function processGraficoLinhaData(data) {
        const cursosGraficoLinha = {};

        for (const [cursoId, atividades] of Object.entries(data)) {
            if (!cursosGraficoLinha[cursoId]) cursosGraficoLinha[cursoId] = {};

            atividades.forEach(atividade => {
                const date = atividade.dataEntrega;
                if (!cursosGraficoLinha[cursoId][date]) cursosGraficoLinha[cursoId][date] = 0;
                cursosGraficoLinha[cursoId][date] += atividade.pontosAtividade;
            });
        }

        const allDates = new Set();
        Object.values(cursosGraficoLinha).forEach(cursoData => {
            Object.keys(cursoData).forEach(date => allDates.add(date));
        });
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

        const datasetsLinha = Object.keys(cursosGraficoLinha).map(cursoId => {
            const cursoNome = data[cursoId]?.[0]?.cursoNome || `Curso ${cursoId}`;
            const corGrafico = getRandomColor();
            return {
                label: cursoNome,
                data: sortedDates.map(date => cursosGraficoLinha[cursoId][date] || 0),
                fill: false,
                borderColor: corGrafico,
                backgroundColor: corGrafico
            };
        });

        return { labelsLinha: sortedDates, datasetsLinha };
    }

    function processGraficoBarraData(data) {
        const cursosGraficoBarra = {};
        const meses = new Set();

        for (const [cursoKey, pontosPorMes] of Object.entries(data)) {
            const match = cursoKey.match(/\((\d+),\s(.+)\)/);
            if (!match) {
                console.error(`Formato inesperado da chave do curso: ${cursoKey}`);
                continue;
            }

            const cursoId = match[1];
            const cursoNome = match[2];

            if (!cursosGraficoBarra[cursoId]) cursosGraficoBarra[cursoId] = { nome: cursoNome, pontos: {} };

            for (const [mes, pontos] of Object.entries(pontosPorMes)) {
                meses.add(mes);
                if (!cursosGraficoBarra[cursoId].pontos[mes]) cursosGraficoBarra[cursoId].pontos[mes] = 0;
                cursosGraficoBarra[cursoId].pontos[mes] += pontos;
            }
        }

        const sortedMonths = Array.from(meses).sort((a, b) => new Date(a + "-01") - new Date(b + "-01"));

        const datasetsBarra = Object.keys(cursosGraficoBarra).map(cursoId => {
            const cursoNome = cursosGraficoBarra[cursoId].nome;
            const corGrafico = getRandomColorBarras();
            return {
                label: cursoNome,
                data: sortedMonths.map(mes => cursosGraficoBarra[cursoId].pontos[mes] || 0),
                backgroundColor: corGrafico,
                borderColor: corGrafico,
                borderWidth: 1
            };
        });

        return { labelsBarra: sortedMonths, datasetsBarra };
    }

    function renderLineChart(labels, datasets) {
        const ctx = document.getElementById('pontosLinhaChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderBarChart(labels, datasets) {
        const ctx = document.getElementById('pontosBarraChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function initMedalhaSelect() {
        fetch('http://localhost:8080/pontuacoes/pontos-totais/1')
            .then(response => response.json())
            .then(data => {
                const courseSelect = document.getElementById('course-select');
                const medalhaCurso = document.getElementById('medalha-curso');

                courseSelect.innerHTML = '<option value="" disabled selected>Selecione um curso</option>';
    
                Object.keys(data).forEach(key => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = data[key].nomeCurso;
                    courseSelect.appendChild(option);
                });
    
                courseSelect.addEventListener('change', function() {
                    const selectedCourseId = this.value;
                    const selectedCourse = data[selectedCourseId];
    
                    if (selectedCourse) {
                    
                        const points = selectedCourse.pontosTotais;
                        let medalSrc = '../imgs/ouro_dash.png'; 
    
                        if (points >= 600) {
                            medalSrc = '../imgs/gold medal.png'; 
                        } else if (points >= 500) {
                            medalSrc = '../imgs/silver medal.png';
                        } else if (points >= 100) {
                            medalSrc = '../imgs/bronze medal.png'; 
                        }
    
                        medalhaCurso.src = medalSrc;
                    }
                });
    
        
                medalhaCurso.src = '../imgs/ouro_dash.png'; 
            })
            .catch(error => console.error('Erro ao buscar dados de pontos:', error));
    }
    

    function getTopCurso(pontosPorCursoData) {
        let topCurso = null;
        let maxPontos = -1;
    
        for (const cursoId in pontosPorCursoData) {
            if (pontosPorCursoData[cursoId].pontosTotais > maxPontos) {
                maxPontos = pontosPorCursoData[cursoId].pontosTotais;
                topCurso = pontosPorCursoData[cursoId];
            }
        }
    
        return topCurso;
    }
    
    function updateTopCursoDisplay(topCurso) {
        const nomeCursoElem = document.getElementById('nomeCurso');
        const nivelElem = document.getElementById('nivel');
        const medalhaElem = document.getElementById('top-medalha');
    
        if (topCurso) {
            nomeCursoElem.textContent = topCurso.nomeCurso;
            nivelElem.innerHTML = `Nível: ${getMedalha(topCurso.pontosTotais)}`;
            medalhaElem.src = getMedalhaSrc(topCurso.pontosTotais);
        }
    }

    function updateClass(element, addClass, removeClass) {
        element.classList.add(addClass);
        if (removeClass) element.classList.remove(removeClass);
    }

    function getMedalha(pontosTotais) {
        if (pontosTotais >= 600) return '<span class="gold-text">Ouro</span>';
        if (pontosTotais >= 500) return '<span class="silver-text">Prata</span>';
        if (pontosTotais >= 100) return '<span class="bronze-text">Bronze</span>';
        return '<span class="no-medal">Nenhuma Medalha</span>';
    }
    
    function getMedalhaSrc(pontosTotais) {
        if (pontosTotais >= 600) return '../imgs/gold medal.png';
        if (pontosTotais >= 500) return '../imgs/silver medal.png';
        if (pontosTotais >= 100) return '../imgs/bronze medal.png';
        return '../imgs/no_medal_dash.png';
    }

    function getRandomColor() {
        return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
    }

    function getRandomColorBarras() {
        return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
    }
});
