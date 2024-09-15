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

        const pontosData = await fetchData(`http://localhost:8080/grafico/pontosPorCursoAoMes/${user.id}`);
        initCursoSelect(cursos, pontosData);

        const pontosPorCursoData = await fetchData(`http://localhost:8080/grafico/pontos-por-curso?idUsuario=${user.id}`);
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
        if (!pontosSemanaElement) {
            console.error('Elemento com ID "pontos-semana" não encontrado.');
            return;
        }
    
        const semanaPassadaPontosElement = document.getElementById('semana-passada-pontos');
        if (!semanaPassadaPontosElement) {
            console.error('Elemento com ID "semana-passada-pontos" não encontrado.');
            return;
        }
    
        const pontosSemanaChangeElement = document.getElementById('pontos-semana-change');
        if (!pontosSemanaChangeElement) {
            console.error('Elemento com ID "pontos-semana-change" não encontrado.');
            return;
        }
    
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
    
        // Agrupa os pontos de atividades por curso e data
        for (const [cursoId, atividades] of Object.entries(data)) {
            if (!cursosGraficoLinha[cursoId]) cursosGraficoLinha[cursoId] = {};
    
            atividades.forEach(atividade => {
                const date = atividade.dataEntrega; // Usa o formato YYYY-MM-DD diretamente
                if (!cursosGraficoLinha[cursoId][date]) cursosGraficoLinha[cursoId][date] = 0;
                cursosGraficoLinha[cursoId][date] += atividade.pontosAtividade;
            });
        }
    
        // Ordena todas as datas
        const allDates = new Set();
        Object.values(cursosGraficoLinha).forEach(cursoData => {
            Object.keys(cursoData).forEach(date => allDates.add(date));
        });
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    
        // Cria os datasets para o gráfico
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
    

    function renderLineChart(labels, datasets) {
        const ctxLinha = document.getElementById('pontosLinhaChart').getContext('2d');
        new Chart(ctxLinha, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: { tooltip: { mode: 'index', intersect: false } },
                scales: {
                    x: { title: { display: true, text: 'Data' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Pontos' } }
                }
            }
        });
    }
    

    function initCursoSelect(cursos, pontosData) {
        const cursoSelect = document.getElementById('cursoSelect');
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.text = curso;
            cursoSelect.add(option);
        });
        cursoSelect.addEventListener('change', () => updateBarChart(cursoSelect.value, pontosData));
        if (cursos.length > 0) {
            cursoSelect.value = cursos[0];
            updateBarChart(cursos[0], pontosData);
        }
    }

    function updateBarChart(cursoSelecionado, pontosData) {
        const filteredData = pontosData.filter(p => p.nome === cursoSelecionado);
        const meses = [1, 2, 3, 4, 5, 6].map(mes => `${mes}/${new Date().getFullYear()}`);
        const data = meses.map(mes => (filteredData.find(p => p.mes === parseInt(mes)) || {}).pontos || 0);

        const ctxBarra = document.getElementById('pontosBarraChart').getContext('2d');
        const chartBarra = Chart.getChart(ctxBarra) || new Chart(ctxBarra, { type: 'bar' });
        chartBarra.data = {
            labels: meses,
            datasets: [{ label: cursoSelecionado, data, backgroundColor: getRandomColorBarras() }]
        };
        chartBarra.update();
    }

    function initMedalhaSelect(pontosPorCursoData) {
        const courseSelect = document.getElementById('course-select');
        pontosPorCursoData.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.idCurso;
            option.text = curso.nomeCurso;
            courseSelect.add(option);
        });
        courseSelect.addEventListener('change', () => updateMedalha(pontosPorCursoData.find(c => c.idCurso == courseSelect.value)));
        if (pontosPorCursoData.length > 0) updateMedalha(pontosPorCursoData[0]);
    }

    function updateMedalha(curso) {
        const medalha = document.getElementById('medalha-curso');
        const nivel = curso.totalPontos > 4000 ? 'Ouro' : curso.totalPontos > 2000 ? 'Prata' : 'Bronze';
        medalha.src = `../imgs/${nivel.toLowerCase()} medal.png`;
        medalha.alt = nivel;
    }

    function getTopCurso(data) {
        return data.reduce((top, curso) => curso.totalPontos > top.totalPontos ? curso : top, data[0]);
    }

    function updateTopCursoDisplay(topCurso) {
        const nivel = topCurso.totalPontos > 4000 ? 'Ouro' : topCurso.totalPontos > 2000 ? 'Prata' : 'Bronze';
        document.getElementById('nomeCurso').innerText = topCurso.nomeCurso;
        const nivelElement = document.getElementById('nivel');
        nivelElement.innerText = `Nível ${nivel}`;
        nivelElement.classList.add(`${nivel.toLowerCase()}-text`);
    }

    function getRandomColor() {
        return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
    }

    function getRandomColorBarras() {
        return `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`;
    }

    // Função para atualizar as classes de elementos dinamicamente
    function updateClass(element, addClass, removeClass = '') {
        element.classList.add(addClass);
        if (removeClass) element.classList.remove(removeClass);
    }
});
