document.addEventListener("DOMContentLoaded", async function () {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
        // Confirma o conteúdo do objeto
        console.log(user);

        // Preenche o nome e o email do usuário
        document.getElementById('id_nome_usuario').innerText = user.nomeUsuario || 'Nome não disponível';
        document.getElementById('id_email_usuario').innerText = user.email || 'Email não disponível';

        // Preenche as datas
        document.getElementById('span_data_criacao').innerText = user.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString() : 'Data não disponível';
        document.getElementById('span_data_ultima_atualizacao').innerText = user.dataAtualizacao ? new Date(user.dataAtualizacao).toLocaleDateString() : 'Não houve nenhuma atualização';
    } else {
        // Caso não haja dados no sessionStorage
        document.getElementById('id_nome_usuario').innerText = 'Nome não disponível';
        document.getElementById('id_email_usuario').innerText = 'Email não disponível';
        document.getElementById('span_data_criacao').innerText = 'Data não disponível';
        document.getElementById('span_data_ultima_atualizacao').innerText = 'Não houve nenhuma atualização';
    }

    async function fetchProfileImage() {
        if (user && user.idUsuario) {
            try {
                const response = await fetch(`http://localhost:8080/usuarios/imagem/${user.idUsuario}`);
                if (response.ok) {
                    const imageData = await response.blob();
                    const imageUrl = URL.createObjectURL(imageData);
                    document.querySelector('.perfil-imagem-editar').src = imageUrl;
                    document.querySelector
                } else {
                    document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
                }
            } catch (error) {
                console.error('Erro ao buscar imagem do perfil:', error);
                document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
            }
        } else {
            document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
        }
    }

    // Carrega a imagem de perfil inicial
    await fetchProfileImage();

    // Seletores
    const uploadButton = document.querySelector('.upload_button');
    const fileInput = document.getElementById('upload');
    const profileImage = document.querySelector('.perfil-imagem-editar');

    if (uploadButton && fileInput && profileImage) {
        // Evento de mudança no input de arquivo
        fileInput.addEventListener('change', function () {
            const file = fileInput.files[0];

            if (file) {
                console.log('Imagem selecionada:', file.name);

                // Cria uma URL de objeto para mostrar a imagem selecionada
                const reader = new FileReader();
                reader.onload = function (e) {
                    profileImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                console.error('Nenhum arquivo selecionado.');
            }
        });

        // Evento de clique no botão de upload
        uploadButton.addEventListener('click', async function () {
            const file = fileInput.files[0];

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const byteArray = new Uint8Array(arrayBuffer);

                    const response = await fetch(`http://localhost:8080/atualizar-imagem/${user.idUsuario}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': file.type
                        },
                        body: byteArray
                    });

                    if (response.ok) {
                        console.log('Imagem enviada com sucesso!');
                        await fetchProfileImage(); // Recarrega a imagem de perfil após o upload
                    } else {
                        console.error('Falha ao enviar a imagem.');
                    }
                } catch (error) {
                    console.error('Erro ao enviar a imagem:', error);
                }
            } else {
                console.error('Nenhum arquivo selecionado.');
            }
        });
    } else {
        console.error('Botão de upload, input de arquivo ou imagem de perfil não encontrado.');
    }
});

function validarApelido(apelidoInput) {
    const apelidoValue = apelidoInput.value.trim();
    return apelidoValue === '' ? 'O apelido não pode estar vazio.' : true;
}

function validarSobrenome(sobrenomeInput) {
    const sobrenomeValue = sobrenomeInput.value.trim();
    return sobrenomeValue === '' ? 'O sobrenome não pode estar vazio.' : true;
}

function validarCEP(cepInput) {
    const cepValue = cepInput.value.trim();
    if (cepValue === '') return true;
    const regex = /^[0-9]{5}-?[0-9]{3}$/;
    return regex.test(cepValue) ? true : 'O formato do CEP é inválido.';
}

function validarEstado(estadoInput) {
    const estadoValue = estadoInput.value.trim();
    return estadoValue === '' ? 'O estado não pode estar vazio.' : true;
}

function validarCidade(cidadeInput) {
    const cidadeValue = cidadeInput.value.trim();
    return cidadeValue === '' ? 'A cidade não pode estar vazia.' : true;
}

function validarRua(ruaInput) {
    const ruaValue = ruaInput.value.trim();
    return ruaValue === '' ? 'A rua não pode estar vazia.' : true;
}

function validarEmail(emailInput) {
    const emailValue = emailInput.value.trim();
    if (emailValue === '') return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailValue) ? true : 'O formato do e-mail é inválido.';
}

function validarSenha(senhaInput, confirmacaoSenhaInput) {
    const senhaValue = senhaInput.value.trim();
    const confirmacaoSenhaValue = confirmacaoSenhaInput.value.trim();
    if (senhaValue === '') return true;
    if (senhaValue.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    return senhaValue !== confirmacaoSenhaValue ? 'As senhas não coincidem.' : true;
}

async function salvarMudancas(event) {
    event.preventDefault();

    const apelidoInput = document.getElementById('apelido');
    const sobrenomeInput = document.getElementById('sobrenome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const senhaConfirmacaoInput = document.getElementById('conf_senha');
    const cepInput = document.getElementById('cep');
    const estadoInput = document.getElementById('estado');
    const cidadeInput = document.getElementById('cidade');
    const ruaInput = document.getElementById('rua');

    const data = JSON.parse(sessionStorage.getItem('user'));
    const idUsuario = data.idUsuario;
    const idEndereco = data.endereco.id;

    let updates = {};
    let erros = [];
    let enderecoUpdates = {};

    // Validação e atualização do apelido, se estiver preenchido
    const apelido = apelidoInput.value.trim();
    if (apelido !== '') {
        const apelidoError = validarApelido(apelidoInput);
        if (apelidoError !== true) {
            erros.push(apelidoError);
        } else {
            updates.primeiroNome = apelido;

            const sobrenome = sobrenomeInput.value.trim();
            // Se o sobrenome for preenchido, concatenamos o apelido e o sobrenome
            if (sobrenome !== '') {
                updates.nomeUsuario = `${apelido} ${sobrenome}`;
            } else {
                // Caso não tenha sobrenome, usamos apenas o apelido como nome completo
                updates.nomeUsuario = apelido;
            }
        }
    }

    // Verifica e valida o campo de sobrenome, se estiver preenchido
    if (sobrenomeInput.value.trim() !== '') {
        const sobrenomeError = validarSobrenome(sobrenomeInput);
        if (sobrenomeError !== true) erros.push(sobrenomeError);
        else updates.sobrenome = sobrenomeInput.value.trim();
    }

    // Verifica e valida o campo de e-mail, se estiver preenchido
    if (emailInput.value.trim() !== '') {
        const emailError = validarEmail(emailInput);
        if (emailError !== true) erros.push(emailError);
        else updates.email = emailInput.value.trim();
    }

    // Verifica e valida o campo de senha, se estiver preenchido
    if (senhaInput.value.trim() !== '' || senhaConfirmacaoInput.value.trim() !== '') {
        const senhaError = validarSenha(senhaInput, senhaConfirmacaoInput);
        if (senhaError !== true) erros.push(senhaError);
        else updates.senha = senhaInput.value.trim();
    }

    // Verifica se todos os campos de endereço estão preenchidos
    if (cepInput.value.trim() !== '' || estadoInput.value.trim() !== '' || cidadeInput.value.trim() !== '' || ruaInput.value.trim() !== '') {
        if (cepInput.value.trim() === '' || estadoInput.value.trim() === '' || cidadeInput.value.trim() === '' || ruaInput.value.trim() === '') {
            erros.push('Todos os campos de endereço (CEP, Estado, Cidade, Rua) devem estar preenchidos.');
        } else {
            enderecoUpdates.cep = cepInput.value.trim();
            enderecoUpdates.estado = estadoInput.value.trim();
            enderecoUpdates.cidade = cidadeInput.value.trim();
            enderecoUpdates.rua = ruaInput.value.trim();
        }
    }

    // Verifica se há erros
    if (erros.length > 0) {
        showAlert(erros.join('\n'), 'error');
        return;
    }

    // Verifica se há algo a ser atualizado
    if (Object.keys(updates).length === 0 && Object.keys(enderecoUpdates).length === 0) {
        showAlert('Nenhuma alteração detectada.', 'error');
        return;
    }

    try {
        // Atualiza as informações de usuário
        if (Object.keys(updates).length > 0) {
            const response = await fetch(`http://localhost:8080/usuarios/atualizar/${idUsuario}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Erro ao tentar atualizar as informações do usuário');
            }
        }

        // Atualiza o endereço se necessário
        if (Object.keys(enderecoUpdates).length > 0) {
            const enderecoResponse = await fetch(`http://localhost:8080/enderecos/atualizar/${idEndereco}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(enderecoUpdates)
            });

            if (!enderecoResponse.ok) {
                throw new Error('Erro ao tentar atualizar o endereço');
            }
        }

        showAlert("Informações atualizadas com sucesso. Você será redirecionado para a tela de login.", 'success');

        // Limpa todas as inputs
        apelidoInput.value = '';
        sobrenomeInput.value = '';
        emailInput.value = '';
        senhaInput.value = '';
        senhaConfirmacaoInput.value = '';
        cepInput.value = '';
        estadoInput.value = '';
        cidadeInput.value = '';
        ruaInput.value = '';

        // Redireciona o usuário após um tempo
        setTimeout(() => {
            window.location.href = '/html/login.html';
        }, 3000);

        // Atualiza a senha, se necessário
        if (updates.senha) {
            try {
                const novaSenha = updates.senha;

                const senhaResponse = await fetch('http://localhost:8080/reset-senha/nova-senha', {
                    method: 'PATCH',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: data.email, novaSenha })
                });

                if (!senhaResponse.ok) {
                    throw new Error('Erro ao atualizar a senha');
                }
            } catch (error) {
                showAlert('Erro ao tentar atualizar a senha', 'error');
            }
        }

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alerta');
    const alertTitle = alertBox.querySelector('.titulo_alerta');
    const alertText = alertBox.querySelector('.texto_alerta');

    // Define o título e o texto do alerta
    alertTitle.textContent = type === 'success' ? 'Sucesso' : 'Erro';
    alertText.textContent = message;

    // Define a classe para o tipo de alerta
    alertBox.className = `container_alerta show ${type}`;
    alertBox.style.display = 'block';

    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.style.opacity = '1';
        }, 500);
    }, 3000);
}

async function fazerLogout() {
    const user = JSON.parse(sessionStorage.getItem('user'))

    try {

        const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.idUsuario}`, {
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

document.getElementById('cep').addEventListener('blur', buscarCep);

function buscarCep() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, ''); // Remove qualquer caractere que não seja dígito
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    if (cep.length === 8) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar o CEP');
                }
                return response.json();
            })
            .then(data => {
                if (data.erro) {
                    showAlert('CEP não encontrado.', 'error');
                    return;
                }

                document.getElementById('rua').value = data.logradouro;
                document.getElementById('estado').value = data.uf;
                document.getElementById('cidade').value = data.localidade;
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                showAlert('Erro ao buscar o CEP. Verifique sua conexão e tente novamente.', 'error');
            });
    } else {
        showAlert('CEP inválido. O CEP deve conter 8 dígitos.', 'error');
    }
}
