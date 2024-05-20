
async function realizarLogin(){

    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
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

        if (data.success) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            console.alert('Login bem sucedido');
        } else {
            console.alert('Email ou senha incorretos');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar fazer login');
    }
}