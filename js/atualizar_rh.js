document.addEventListener("DOMContentLoaded", function () {
    // Recupera o item 'user' do sessionStorage
    const data = JSON.parse(sessionStorage.getItem('user'));

    // Obtém o elemento input pelo ID
    const emailInput = document.getElementById('novo_email');
    const telefoneInput = document.getElementById('novo_telefone');
    const idUsuario = data.idUsuario;

    // Configura os placeholders com os dados do usuário
    emailInput.placeholder = data.email || 'novo.email@email.com';
    telefoneInput.placeholder = data.telefone
});

function validarEmail(emailInput) {
    const emailValue = emailInput.value.trim();
    if (emailValue === '') {
        return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailValue)) {
        return 'O formato do e-mail é inválido.';
    }
    return true;
}

function validarTelefone(telefoneInput) {
    const telefoneValue = telefoneInput.value.trim();
    if (telefoneValue === '') {
        return true;
    }
    const regex = /^(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    if (!regex.test(telefoneValue)) {
        return 'O formato do telefone é inválido.';
    }
    return true;
}

function validarSenha(senhaInput, confirmacaoSenhaInput) {
    const senhaValue = senhaInput.value.trim();
    const confirmacaoSenhaValue = confirmacaoSenhaInput.value.trim();
    if (senhaValue === '') {
        return true;
    }
    if (senhaValue.length < 6) {
        return 'A senha deve ter no mínimo 6 caracteres.';
    }
    if (senhaValue !== confirmacaoSenhaValue) {
        return 'As senhas não coincidem.';
    }
    return true;
}

async function salvarMudancas() {
    const emailInput = document.getElementById('novo_email');
    const telefoneInput = document.getElementById('novo_telefone');
    const senhaInput = document.getElementById('nova_senha');
    const senhaConfirmacaoInput = document.getElementById('nova_senha_confirmacao');

    const data = JSON.parse(sessionStorage.getItem('user'));
    const idUsuario = data.idUsuario;

    let updates = {};
    let erros = [];

    // Validação do e-mail
    const emailError = validarEmail(emailInput);
    if (emailError !== true) {
        erros.push(emailError);
    } else {
        const email = emailInput.value.trim();
        if (email !== '') {
            updates.email = email;
        }
    }

    // Validação do telefone
    const telefoneError = validarTelefone(telefoneInput);
    if (telefoneError !== true) {
        erros.push(telefoneError);
    } else {
        const telefone = telefoneInput.value.trim();
        if (telefone !== '') {
            updates.telefone = telefone;
        }
    }

    // Validação da senha
    const senhaError = validarSenha(senhaInput, senhaConfirmacaoInput);
    if (senhaError !== true) {
        erros.push(senhaError);
    } else {
        const senha = senhaInput.value.trim();
        if (senha !== '') {
            updates.senha = senha;
        }
    }

    if (erros.length > 0) {
        console.log('Erros de validação:', erros);
        showAlert(erros.join('\n'), 'error');
        return;
    }

    if (Object.keys(updates).length === 0) {
        console.log('Nenhuma alteração detectada.');
        showAlert('Nenhuma alteração detectada.', 'error');
        return;
    }

    console.log('Atualizações:', updates);

    try {
        // Atualização das informações do usuário
        const response = await fetch(`http://localhost:8080/usuarios/atualizar/${idUsuario}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });

        const responseText = await response.text();

        if (response.ok) {
            console.log('Resposta do servidor:', responseText);
            showAlert("Informações atualizadas com sucesso", 'success');

            // Se a senha foi modificada, realiza a atualização da senha
            if (updates.senha) {
                try {
                    const email = data.email;
                    const novaSenha = updates.senha;

                    const senhaResponse = await fetch('http://localhost:8080/reset-senha/nova-senha', {
                        method: 'PATCH',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, novaSenha })
                    });

                    const senhaResponseText = await senhaResponse.text(); // Captura o texto da resposta

                    if (senhaResponse.ok) {
                        console.log('Senha atualizada com sucesso.', senhaResponseText);
                        showAlert("Senha atualizada com sucesso", 'success');
                    } else {
                        console.error('Erro ao atualizar a senha:', senhaResponseText);
                        showAlert('Erro ao atualizar a senha', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao tentar atualizar a senha:', error);
                    showAlert('Erro ao tentar atualizar a senha', 'error');
                }
            }

        } else {
            console.error('Erro no servidor:', responseText);
            showAlert('Erro ao tentar atualizar as informações', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao tentar atualizar as informações', 'error');
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