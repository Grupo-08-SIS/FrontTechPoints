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
        console.log(data);

        if (data.idUsuario) {
            // Adiciona a senha aos dados do usuário
            data.senha = senha;
            sessionStorage.setItem('user', JSON.stringify(data));
            console.log('Login bem sucedido');
            
            if(data.deletado == false){
                switch (data.tipoUsuario) {
                    case 1 :
                        window.location.href = 'dash_aluno.html';
                        break
                    
                    case 2 : 
                        window.location.href = 'dash_aluno.html';
                        break
    
                    case 3 :
                        window.location.href = 'tela_rh_vagas.html';
                        break
                }
            } else {
                console.log("Não foi possivel fazer login, conta deletada")
            }
            
            
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
