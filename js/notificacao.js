function toggleNotificacao() {
    const notificacaoDropdown = document.getElementById('notificacao-dropdown');
    const iconeNotificacao = document.querySelector('.icone-notificacao');

    if (notificacaoDropdown.classList.contains('show')) {
        notificacaoDropdown.classList.add('hide');
        notificacaoDropdown.classList.remove('show');

        setTimeout(() => {
            notificacaoDropdown.style.display = 'none';
            notificacaoDropdown.classList.remove('hide');
        }, 300);
    } else {
        notificacaoDropdown.style.display = 'block';
        notificacaoDropdown.classList.add('show');

        iconeNotificacao.classList.add('shake');
        setTimeout(() => {
            iconeNotificacao.classList.remove('shake');
        }, 500);
    }
}

document.addEventListener('click', function (event) {
    const notificacao = document.querySelector('.notificacao');
    const dropdown = document.getElementById('notificacao-dropdown');

    if (!notificacao.contains(event.target)) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.add('hide');
            dropdown.classList.remove('show');
            setTimeout(() => {
                dropdown.style.display = 'none';
                dropdown.classList.remove('hide');
            }, 300);
        }
    }
});

async function buscarNotificacoes() {
    const user = JSON.parse(sessionStorage.getItem("user")); // Pega o objeto do usuário corretamente
    const idAluno = user?.id; // Extrai o ID do aluno

    if (!idAluno) {
        console.log("ID do aluno não encontrado.");
        return;
    }

    try {
        // Constrói a URL dinamicamente com o idAluno
        const url = `http://localhost:8080/notificacoes/${idAluno}`;

        const response = await fetch(url); // Requisição para buscar notificações

        // Verifica se a resposta foi bem-sucedida
        if (response.ok) {
            // Verifica se o corpo da resposta não está vazio
            if (response.status === 204) {
                console.log("Nenhuma notificação encontrada.");
                exibirNotificacoes([]); // Passa um array vazio para exibir o "Nenhuma notificação"
            } else {
                const notificacoes = await response.json(); // Converte a resposta para JSON
                console.log(notificacoes);

                exibirNotificacoes(notificacoes); // Função que exibe as notificações
            }
        } else {
            console.log("Erro ao buscar as notificações:", response.status);
            exibirNotificacoes([]); // Exibe "Nenhuma notificação" se houver erro
        }
    } catch (error) {
        console.log("Erro ao fazer a requisição:", error);
        exibirNotificacoes([]); // Exibe "Nenhuma notificação" caso ocorra um erro na requisição
    }
}

function exibirNotificacoes(notificacoes) {
    const listaNotificacoes = document.getElementById("notificacao-lista");

    // Limpa as notificações anteriores
    listaNotificacoes.innerHTML = '';

    // Verifica se a lista de notificações está vazia
    if (notificacoes.length === 0) {
        // Cria um item de lista com a mensagem de nenhuma notificação
        const li = document.createElement("li");
        li.textContent = "Nenhuma notificação";
        listaNotificacoes.appendChild(li);  // Adiciona a mensagem à lista
        return;
    }

    // Inverte a ordem das notificações para as últimas aparecerem primeiro
    notificacoes.reverse().forEach(notificacao => {
        let mensagem = '';

        // Verificando o tipo de lista
        if (notificacao.lista === "interessados") {
            const recrutadorNome = notificacao.recrutador.replace(/_/g, ' ');
            mensagem = `O recrutador <b>${recrutadorNome}</b> da empresa <b>${notificacao.empresa}</b> se <b>interessou</b> por você.`;
        } else if (notificacao.lista === "processoSeletivo") {
            mensagem = `Muito bem, você entrou no <b>processo seletivo</b> da empresa: <b>${notificacao.empresa}</b>.`;
        } else if (notificacao.lista === "contratados") {
            mensagem = `Parabéns, você foi <b>contratado pela empresa</b>: <b>${notificacao.empresa}</b> 🎉🎉🎉`;
        }

        // Se a lista for "favoritos", não exibe a notificação
        if (notificacao.lista === "favoritos") {
            return;
        }

        // Formatar a data para um formato legível
        const dataFormatada = formatarData(notificacao.data);

        // Cria um novo item de lista para a notificação
        const li = document.createElement("li");
        li.setAttribute("data-id", notificacao.id); // Atribui o id da notificação ao li para referência posterior

        li.innerHTML = `
        <div>${mensagem}</div>
        <div>
            <button class="marcar-lida" onclick="marcarComoLida(event, ${notificacao.id})">Marcar como lida</button>     
            <span class="data-notificacao">${dataFormatada}</span>       
        </div>
        `;

        // Adiciona o item à lista de notificações
        listaNotificacoes.appendChild(li);
    });
}

function formatarData(dataString) {
    const data = new Date(dataString);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do 0, então somamos 1
    const ano = data.getFullYear();

    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}


function marcarComoLida(event) {
    // Verifica se o evento é válido
    if (!event || !event.preventDefault) {
        console.log("Evento inválido");
        return;
    }

    event.preventDefault();
    event.stopPropagation(); // Previne o evento de propagação, para que o dropdown não feche

    const user = JSON.parse(sessionStorage.getItem("user")); // Pega o objeto do usuário corretamente
    const idAluno = user?.id; // Extrai o ID do aluno
    const idNotificacao = event.target.closest("li").getAttribute("data-id"); // Pega o ID da notificação clicada
    console.log("ID da notificação:", idNotificacao); // Aqui você já tem o ID da notificação que foi clicada

    // Verifica se os IDs são válidos
    if (!idAluno || !idNotificacao || isNaN(idAluno) || isNaN(idNotificacao)) {
        alert("IDs inválidos. Verifique os valores.");
        return;
    }

    const url = `http://localhost:8080/notificacoes/${idAluno}/notificacoes/${idNotificacao}/marcar-como-lida`;

    // Requisição para marcar a notificação como lida
    fetch(url, {
        method: 'PATCH',
    })
        .then(response => response.json())
        .then(data => {
            console.log('Notificação marcada como lida:', data);

            // Agora vamos atualizar a interface para refletir a mudança visual
            const li = document.querySelector(`li[data-id="${idNotificacao}"]`);

            if (li) {
                li.style.opacity = "0.5";  // Altera a opacidade
                li.classList.add("lida");  // Marca como lida visualmente

                // Desabilita o botão
                const button = li.querySelector(".marcar-lida");
                if (button) {
                    button.disabled = true;
                    button.textContent = "Lida";
                }
            }
        })
        .catch(error => {
            console.error('Erro ao marcar como lida:', error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    exibirNotificacoes(notificacoes);
});

window.onload = buscarNotificacoes;