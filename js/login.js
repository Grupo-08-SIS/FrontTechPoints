async function realizarLogin() {
    const email = document.getElementById('inputEmail').value;
    const senha = document.getElementById('inputSenha').value;

    try {
        const response = await fetch('http://localhost:8080/usuarios/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error('Erro ao tentar fazer login');
        }

        const data = await response.json();

        if (data.idUsuario) {
            sessionStorage.setItem('user', JSON.stringify(data));
            console.log('Login bem sucedido');
            
            window.location.href = '/html/dash_aluno.html';
        } else {
            console.log('Email ou senha incorretos');
            alert('Email ou senha incorretos');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar fazer login');
    }
}

function esqueciSenha() {
    // Implementar funcionalidade de recuperação de senha aqui
}
