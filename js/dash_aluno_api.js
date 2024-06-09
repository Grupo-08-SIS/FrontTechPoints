document.addEventListener('DOMContentLoaded', async function() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.idUsuario) {
        try {
          
            const atividadesResponse = await fetch(`http://localhost:8080/grafico/atividadesDoUsuario/${user.idUsuario}`);
            if (!atividadesResponse.ok) {
                throw new Error('Erro ao buscar dados das atividades');
            }
            const atividadesData = await atividadesResponse.json();


            let totalAtividades = 0;
            let atividadesFeitas = 0;
            let cursos = [];

            atividadesData.forEach(curso => {
                totalAtividades += curso.totalAtividades;
                atividadesFeitas += curso.atividadesFeitas;
                cursos.push(curso.curso);
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

            const pontosResponse = await fetch(`http://localhost:8080/grafico/pontosDaSemana/${user.idUsuario}`);
            if (!pontosResponse.ok) {
                throw new Error('Erro ao buscar dados dos pontos da semana');
            }
            const pontosData = await pontosResponse.json();

            document.getElementById('pontos-semana').innerText = `${pontosData.pontosSemanaAtual} pts`;

            const pontosChangeElement = document.getElementById('pontos-semana-change');
            const semanaPassadaChangeElement = document.getElementById('semana-passada-change');

            if (pontosData.diferencaPontos >= 0) {
                pontosChangeElement.classList.remove('red');
                pontosChangeElement.classList.add('green');
                pontosChangeElement.innerText = '⬆';
                semanaPassadaChangeElement.classList.remove('red');
                semanaPassadaChangeElement.classList.add('green');
                semanaPassadaChangeElement.innerText = `+ ⬆ ${pontosData.diferencaPontos} pts`;
            } else {
                pontosChangeElement.classList.remove('green');
                pontosChangeElement.classList.add('red');
                pontosChangeElement.innerText = '⬇';
                semanaPassadaChangeElement.classList.remove('green');
                semanaPassadaChangeElement.classList.add('red');
                semanaPassadaChangeElement.innerText = `${pontosData.diferencaPontos} pts`;
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar dados');
        }
    } else {
      
        window.location.href = '/login.html';
    }
});

