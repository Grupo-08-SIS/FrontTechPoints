document.addEventListener('DOMContentLoaded', function () {
    carregarAlunos();
});

async function carregarAlunos() {
    try {
        const response = await fetch('http://localhost:8080/usuarios/listar?tipo=Aluno')
        if (response.ok) {
            const alunos = await response.json()
            const tabelaAlunos = document.getElementById('tabela-alunos')
            const totalAlunosElement = document.getElementById('total-alunos')

            totalAlunosElement.textContent = alunos.length

            alunos.sort((a, b) => a.id - b.id)

            alunos.forEach(aluno => {
                const tr = document.createElement('tr')

                const idCell = document.createElement('td')
                idCell.textContent = aluno.id;
                idCell.style.verticalAlign = 'middle'

                const imgCell = document.createElement('td')
                const imgElement = document.createElement('img')
                imgElement.id = `img-${aluno.id}`
                imgElement.alt = `Foto de ${aluno.primeiroNome}`
                imgElement.src = '/imgs/foto_padrao.png'
                imgElement.style.width = '50px'
                imgElement.style.height = '50px'
                imgElement.style.borderRadius = '100%'
                imgElement.style.objectFit = 'cover'
                imgCell.appendChild(imgElement)
                imgCell.style.verticalAlign = 'middle'

                const nomeCell = document.createElement('td')
                nomeCell.textContent = `${aluno.primeiroNome} ${aluno.sobrenome}`
                nomeCell.style.verticalAlign = 'middle'

                const emailCell = document.createElement('td')
                emailCell.textContent = aluno.email;
                emailCell.style.verticalAlign = 'middle'

                const cidadeCell = document.createElement('td')
                cidadeCell.textContent = aluno.endereco.cidade
                cidadeCell.style.verticalAlign = 'middle'

                const escolaridadeCell = document.createElement('td')
                escolaridadeCell.textContent = aluno.escolaridade
                escolaridadeCell.style.verticalAlign = 'middle';

                const dataNascimentoCell = document.createElement('td')
                dataNascimentoCell.textContent = new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')
                dataNascimentoCell.style.verticalAlign = 'middle'

                tr.appendChild(idCell)
                tr.appendChild(imgCell)
                tr.appendChild(nomeCell)
                tr.appendChild(emailCell)
                tr.appendChild(cidadeCell)
                tr.appendChild(escolaridadeCell)
                tr.appendChild(dataNascimentoCell)

                tabelaAlunos.appendChild(tr)

                carregarImagemPerfil(aluno.id)
            });
        } else {
            console.error('Erro ao carregar alunos:', response.statusText)
        }
    } catch (error) {
        console.error('Erro ao buscar os alunos:', error)
    }
}


async function carregarImagemPerfil(id) {
    const imgElement = document.getElementById(`img-${id}`)

    if (!imgElement) {
        console.error(`Elemento de imagem não encontrado para o id: ${id}`)
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/usuarios/imagem/${id}`)
        if (response.ok) {
            const imageBlob = await response.blob();
            if (imageBlob.size > 0) {
                const imageUrl = URL.createObjectURL(imageBlob)
                imgElement.src = imageUrl;
            } else {
                console.log(`Imagem não encontrada para o id: ${id}`)
            }
        } else {
            console.error('Erro ao buscar a imagem:', response.status, response.statusText)
        }
    } catch (error) {
        console.error('Erro ao buscar a imagem do perfil:', error)
    }
}
