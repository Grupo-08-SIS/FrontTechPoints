document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('cpf').addEventListener('input', formatarCPF);
    document.getElementById('telefone').addEventListener('input', formatarTelefone);
    document.getElementById('cadastrar').addEventListener('click', realizarCadastro);
});

function realizarCadastro() {
    if (!validarCampos()) {
        showAlert('error', 'Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    cadastrarUsuario().then(id => {
        if (id === null) {
            return;
        }

        showAlert('success', 'Cadastro realizado com sucesso!');
    });
}

function validarCampos() {
    const campos = [
        'username', 'email', 'password', 'firstname',
        'lastname', 'cpf', 'telefone', 'escolaridade'
    ];

    return campos.every(id => {
        const input = document.getElementById(id);
        return input && input.value.trim() !== '';
    });
}

function formatarCPF(event) {
    const cpfInput = event.target;
    let cpfFormatado = cpfInput.value.replace(/\D/g, '');

    if (cpfFormatado.length <= 3) {
        cpfFormatado = cpfFormatado.replace(/(\d{1,3})/, '$1');
    } else if (cpfFormatado.length <= 6) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (cpfFormatado.length <= 9) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    cpfInput.value = cpfFormatado;

    if (cpfInput.value.length > 14) {
        cpfInput.value = cpfInput.value.slice(0, 14);
    }
}

function formatarTelefone(event) {
    const telefoneInput = event.target;
    let telefoneFormatado = telefoneInput.value.replace(/\D/g, '');

    if (telefoneFormatado.length <= 2) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{1,2})/, '($1');
    } else if (telefoneFormatado.length <= 6) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{1,4})/, '($1) $2');
    } else {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    }

    telefoneInput.value = telefoneFormatado;

    if (telefoneInput.value.length > 15) {
        telefoneInput.value = telefoneInput.value.slice(0, 15);
    }
}

async function cadastrarUsuario() {
    const usuario = {
        nomeUsuario: document.getElementById('username').value,
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        senha: document.getElementById('password').value,
        primeiroNome: document.getElementById('firstname').value,
        sobrenome: document.getElementById('lastname').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        tipoUsuario: document.getElementById('is-rh').checked ? 3 : 2,
        escolaridade: document.getElementById('escolaridade').value
    };

    try {
        const response = await fetch('http://localhost:8080/usuarios/cadastro', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        if (response.ok) {
            const data = await response.json();
            return data.idUsuario;
        } else {
            const errorData = await response.json();
            showAlert('error', errorData.message || 'Erro ao realizar cadastro');
            return null;
        }
    } catch (error) {
        showAlert('error', 'Erro ao tentar fazer cadastro');
        return null;
    }
}

function showAlert(type, message) {
    const alertContainer = document.querySelector('.container_alerta');
    const alertTitle = alertContainer.querySelector('.titulo_alerta');
    const alertText = alertContainer.querySelector('.texto_alerta');

    alertTitle.textContent = type === 'success' ? 'Sucesso!' : 'Erro!';
    alertText.textContent = message;

    alertContainer.classList.remove('success', 'error');
    alertContainer.classList.add(type);

    alertContainer.classList.add('show');
    setTimeout(() => alertContainer.classList.remove('show'), 5000); // Oculta o alerta após 5 segundos
}
