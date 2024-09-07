function verificaEmail() {
    const email = document.getElementById('emailInput').value;
    const botaoProximo = document.querySelector('button[onclick="verificaEmail()"]');
    
    if (email) {
        // Desativa o botão e altera o texto para "Carregando..."
        botaoProximo.disabled = true;
        botaoProximo.textContent = "Carregando...";

        sessionStorage.setItem('email', email);
        fetch('http://localhost:8080/reset-senha/solicitar-troca', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        .then(response => {
            if (response.ok) {
                mostrarCampoCodigo();
                showAlert('Código de recuperação enviado para o seu e-mail.', 'success');
            } else {
                // Obtém a mensagem de erro do servidor
                return response.json().then(errorData => {
                    showAlert(errorData.message || 'Falha ao enviar o código. Tente novamente.', 'error');
                });
            }
        })
        .catch(error => {
            showAlert('Erro ao tentar se conectar com o servidor. Tente novamente.', 'error');
        })
        .finally(() => {
            // Reativa o botão e restaura o texto original
            botaoProximo.disabled = false;
            botaoProximo.textContent = "Próximo";
        });
    } else {
        showAlert('Por favor, insira um e-mail válido.', 'error');
    }
}

function verificaToken() {
    const codigo = document.getElementById('codigoInput').value;
    const email = sessionStorage.getItem('email'); 

    if (codigo && email) {
        fetch('http://localhost:8080/reset-senha/verificar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo, email })
        })
            .then(response => {
                if (response.ok) {
                    mostrarCamposSenha(); 
                    showAlert('Código verificado com sucesso. Agora, crie uma nova senha.', 'success');
                } else {
                    return response.json().then(errorData => {
                        showAlert(errorData.message || 'Código inválido. Tente novamente.', 'error');
                    });
                }
            })
            .catch(error => {
                showAlert('Erro ao tentar se conectar com o servidor. Tente novamente.', 'error');
            });
    } else {
        showAlert('Por favor, insira o código de recuperação.', 'error');
    }
}

function validarSenha() {
    const novaSenha = document.getElementById('novaSenhaInput').value;
    const confirmarSenha = document.getElementById('confirmarSenhaInput').value;
    const email = sessionStorage.getItem('email'); 

    // Valida as entradas
    if (!novaSenha || !confirmarSenha) {
        showAlert('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (novaSenha.length < 6) {
        showAlert('A nova senha deve ter pelo menos 6 dígitos.', 'error');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        showAlert('A confirmação da senha não corresponde à nova senha.', 'error');
        return;
    }

    fetch('http://localhost:8080/reset-senha/nova-senha', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, novaSenha })
    })
    .then(response => {
        if (response.ok) {
            showAlert('Senha atualizada com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000); 
        } else {
            return response.json().then(errorData => {
                showAlert(errorData.message || 'Falha ao atualizar a senha. Tente novamente.', 'error');
            });
        }
    })
    .catch(error => {
        showAlert('Erro ao tentar se conectar com o servidor. Tente novamente.', 'error');
    });
}

function mostrarCampoCodigo() {
    document.querySelector('p').style.display = 'none';
    document.getElementById('emailInput').style.display = 'none';

    const botaoProximo = document.querySelector('.bloco-principal button');
    botaoProximo.style.display = 'none';

    const campoCodigo = document.getElementById('campoCodigo');
    campoCodigo.style.display = 'block';
}

function mostrarCamposSenha() {
    const campoCodigo = document.getElementById('campoCodigo');
    campoCodigo.style.display = 'none';

    const campoSenha = document.getElementById('campoSenha');
    campoSenha.style.display = 'block';
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alerta');
    const alertTitle = alertBox.querySelector('.titulo_alerta');
    const alertText = alertBox.querySelector('.texto_alerta');

    alertTitle.textContent = type === 'success' ? 'Sucesso' : 'Erro';
    alertText.textContent = message;

    alertBox.className = `container_alerta show ${type}`;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.style.opacity = '1';
        }, 500);
    }, 3000);
}