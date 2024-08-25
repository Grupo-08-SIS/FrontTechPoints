async function realizarLogin() {
    const email = document.getElementById('inputEmail').value;
    const senha = document.getElementById('inputSenha').value;
    const alertDiv = document.getElementById('alertDiv');

    try {
        console.log('Tentando fazer login com:', email);

        const response = await fetch('http://localhost:8080/usuarios/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error('Erro ao tentar fazer login');
        }

        const data = await response.json();
        console.log('Resposta do login:', data);

        if (data.idUsuario) {
            // Sucesso no login
            data.senha = senha;
            sessionStorage.setItem('user', JSON.stringify(data));
            console.log('Login bem-sucedido, usuário armazenado no sessionStorage');

            if (!data.deletado) {
                // Redirecionamento conforme o tipo de usuário
                switch (data.tipoUsuario) {
                    case 1:
                    case 2:
                        console.log('Redirecionando para dash_aluno.html');
                        window.location.href = 'dash_aluno.html';
                        break;
                    case 3:
                        console.log('Redirecionando para tela_rh_vagas.html');
                        window.location.href = 'tela_rh_vagas.html';
                        break;
                    default:
                        showAlert('error', 'Erro: Tipo de usuário desconhecido');
                        console.error('Tipo de usuário desconhecido');
                }
            } else {
                showAlert('success', 'Sua conta está sendo reativada!');
                console.log('Conta está deletada, tentando reativar...');

                setTimeout(async () => {
                    try {
                        const reativarResponse = await fetch('http://localhost:8080/usuarios/reativar', {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, senha })
                        });

                        if (!reativarResponse.ok) {
                            throw new Error('Erro ao tentar reativar a conta');
                        }

                        console.log('Conta reativada com sucesso');

                        // Redirecionamento após reativação
                        switch (data.tipoUsuario) {
                            case 1:
                            case 2:
                                console.log('Redirecionando para dash_aluno.html após reativação');
                                window.location.href = 'dash_aluno.html';
                                break;
                            case 3:
                                console.log('Redirecionando para tela_rh_vagas.html após reativação');
                                window.location.href = 'tela_rh_vagas.html';
                                break;
                            default:
                                showAlert('error', 'Erro: Tipo de usuário desconhecido após reativação');
                                console.error('Tipo de usuário desconhecido após reativação');
                        }

                    } catch (reativarError) {
                        showAlert('error', 'Erro ao tentar reativar a conta');
                        console.error('Erro ao tentar reativar a conta:', reativarError);
                    }
                }, 1000); // Tempo para mostrar o alerta de reativação

            }

        } else {
            showAlert('error', 'Email ou senha incorretos');
            console.log('Email ou senha incorretos');
        }
    } catch (error) {
        showAlert('error', 'Erro ao tentar fazer login');
        console.error('Erro ao tentar fazer login:', error);
    }
}

function showAlert(type, message) {
    const alertDiv = document.getElementById('alertDiv');
    console.log(`Exibindo alerta: Tipo - ${type}, Mensagem - ${message}`);
    
    // Limpa qualquer alerta existente
    alertDiv.classList.remove('d-none', 'alert-success', 'alert-error', 'fade-in', 'fade-out');
    alertDiv.classList.add(`alert-${type}`, 'fade-in');
    alertDiv.querySelector('.texto_alerta').innerText = message;
    alertDiv.style.display = 'block';

    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => {
            alertDiv.classList.remove('fade-in', 'fade-out');
            alertDiv.classList.add('d-none');
            alertDiv.style.display = 'none'; // Esconde o alerta completamente
        }, 500); // Tempo para completar a transição de fade-out
    }, 3000); // Tempo para manter o alerta visível
}

function esqueciSenha() {
    // Implementar funcionalidade de recuperação de senha aqui
}
