document.addEventListener('DOMContentLoaded', async function() {

    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id) {
        console.error('Usuário não encontrado ou ID inválido.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const atividadesData = await fetchData(`http://localhost:8080/grafico/atividadesDoUsuario/${user.idUsuario}`);
        const { totalAtividades, atividadesFeitas, cursos } = processAtividadesData(atividadesData);
        
        sessionStorage.setItem('cursos', JSON.stringify(cursos));

        const porcentagemFeitas = ((atividadesFeitas / totalAtividades) * 100).toFixed(2);
        updateAtividadesDisplay(porcentagemFeitas);

        const pontosSemanaData = await fetchData(`http://localhost:8080/grafico/pontosDaSemana/${user.idUsuario}`);
        updatePontosSemanaDisplay(pontosSemanaData);

        const graficoLinhaData = await fetchData(`http://localhost:8080/grafico/pontosAoLongoDoTempo/${user.idUsuario}`);
        const { labelsLinha, datasetsLinha } = processGraficoLinhaData(graficoLinhaData);
        renderLineChart(labelsLinha, datasetsLinha);

        const pontosData = await fetchData(`http://localhost:8080/grafico/pontosPorCursoAoMes/${user.idUsuario}`);
        initCursoSelect(cursos, pontosData);

        const pontosPorCursoData = await fetchData(`http://localhost:8080/grafico/pontos-por-curso?idUsuario=${user.idUsuario}`);
        initMedalhaSelect(pontosPorCursoData);

        const topCurso = getTopCurso(pontosPorCursoData);
        updateTopCursoDisplay(topCurso);

    } catch (error) {
        console.error('Erro:', error);
    }

    // Função para buscar dados com tratamento de erro
    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao buscar dados de ${url}`);
        return response.json();
    }

    function processAtividadesData(data) {
        let totalAtividades = 0, atividadesFeitas = 0;
        const cursos = [];
        data.forEach(curso => {
            totalAtividades += curso.totalQtdAtividades;
            atividadesFeitas += curso.totalAtividadesUsuario;
            cursos.push(curso.nomeCurso);
        });
        return { totalAtividades, atividadesFeitas, cursos };
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
        const semanaPassadaChangeElement = document.getElementById('semana-passada-change');
        document.getElementById('pontos-semana').innerText = `${data.pontosSemanaAtual} pts`;
        const diferenca = data.diferencaPontos >= 0 ? '+' : '-';
        semanaPassadaChangeElement.innerText = `${diferenca} ⬆ ${data.diferencaPontos} pts`;
        updateClass(semanaPassadaChangeElement, data.diferencaPontos >= 0 ? 'green' : 'red');
    }

    function processGraficoLinhaData(data) {
        const cursosGraficoLinha = {};
        data.forEach(entry => {
            const date = new Date(entry.data_pontuacao).toLocaleDateString();
            if (!cursosGraficoLinha[entry.nome]) cursosGraficoLinha[entry.nome] = {};
            cursosGraficoLinha[entry.nome][date] = entry.pontos;
        });

        const labelsLinha = Array.from(new Set(data.map(entry => new Date(entry.data_pontuacao).toLocaleDateString()))).sort();
        const datasetsLinha = Object.keys(cursosGraficoLinha).map(curso => ({
            label: curso,
            data: labelsLinha.map(label => cursosGraficoLinha[curso][label] || 0),
            fill: false,
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor()
        }));
        return { labelsLinha, datasetsLinha };
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

    function updateClass(element, addClass, removeClass = '') {
        element.classList.add(addClass);
        if (removeClass) element.classList.remove(removeClass);
    }
});
