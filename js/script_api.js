async function realizarCadastro() {
    const enderecoId = await cadastrarEndereco();
    const isRH = window.location.pathname.includes('cadastro_rh');
    const tipoUsuario = isRH ? 3 : 2;

    if (enderecoId !== null) {
        const id = await cadastrarUsuario(enderecoId);

        if (id && tipoUsuario == 3) {
            await cadastrarDadosEmpresa(id);
        } else if (id) {
            showAlert('success', 'Cadastro realizado com sucesso!');
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        }
    }
}

async function cadastrarEndereco() {
    // Obtendo valores dos campos
    const logradouro = document.getElementById('street').value;
    const numero = document.getElementById('number').value;
    const cidade = document.getElementById('city').value;
    const estado = document.getElementById('state').value;
    const cep = document.getElementById('cep').value;
    const usernameInput = document.getElementById('username').value;
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const firstnameInput = document.getElementById('firstname').value;
    const lastnameInput = document.getElementById('lastname').value;
    const cpfInput = document.getElementById('cpf').value;
    const telefoneInput = document.getElementById('telefone').value;
    const escolaridadeInput = document.getElementById('escolaridade').value;
    const dtNascInput = document.getElementById('dataNascimento').value;

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!logradouro || !numero || !cidade || !estado || !cep ||
        !usernameInput || !emailInput || !passwordInput ||
        !firstnameInput || !lastnameInput || !cpfInput || 
        !telefoneInput || !escolaridadeInput || !dtNascInput) {
        showAlert('error', 'Por favor, preencha todos os campos obrigatórios.');
        return null;
    }

    // Cria o objeto de endereço
    const endereco = {
        cep: cep,
        cidade: cidade,
        estado: estado,
        rua: logradouro,
        numero: numero
    };

    try {
        const response = await fetch('http://localhost:8080/enderecos/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(endereco)
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.status === 201) {
            const enderecoId = data.id;
            console.log('Endereço cadastrado com sucesso! ID:', enderecoId);
            return enderecoId;
        } else {
            console.error('Erro ao cadastrar endereço', response.status, data.message);
            showAlert('error', `Erro ao cadastrar endereço: ${data.message}`);
            return null;
        }
    } catch (error) {
        console.error('Erro ao enviar requisição:', error);
        showAlert('error', 'Erro ao tentar cadastrar o endereço');
        return null;
    }
}

function formatarDataNascimento() {
    const dataInput = document.getElementById('dataNascimento');
    let dataFormatada = dataInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Adiciona a máscara de data
    if (dataFormatada.length <= 2) {
        dataFormatada = dataFormatada.replace(/(\d{1,2})/, '$1');
    } else if (dataFormatada.length <= 4) {
        dataFormatada = dataFormatada.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } else if (dataFormatada.length <= 8) {
        dataFormatada = dataFormatada.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    } else {
        dataFormatada = dataFormatada.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }

    // Atualiza o valor do input com a formatação aplicada
    dataInput.value = dataFormatada;

    // Limita o comprimento do campo
    if (dataInput.value.length > 10) {
        dataInput.value = dataInput.value.slice(0, 10);
    }
}

function formatarDataParaEnvio(data) {
    const partes = data.split('/');
    if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const ano = partes[2];
        return `${ano}-${mes}-${dia}`;
    }
    return '';
}

async function cadastrarUsuario(idEndereco) {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const firstnameInput = document.getElementById('firstname');
    const lastnameInput = document.getElementById('lastname');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const escolaridadeInput = document.getElementById('escolaridade');
    const dtNascInput = document.getElementById('dataNascimento');
    const cepInput = document.getElementById('cep');
    

    // Validação dos campos obrigatórios
    if (!usernameInput.value || !emailInput.value || !passwordInput.value ||
        !firstnameInput.value || !lastnameInput.value || !cpfInput.value ||
        !telefoneInput.value || !escolaridadeInput.value || !dtNascInput.value ||
        !cepInput.value) {
        showAlert('error', 'Por favor, preencha todos os campos obrigatórios.');
        return null;
    }

    const usuario = {
        nomeUsuario: usernameInput.value,
        cpf: cpfInput.value.replace(/\D/g, ''),
        senha: passwordInput.value,
        primeiroNome: firstnameInput.value,
        sobrenome: lastnameInput.value,
        email: emailInput.value,
        telefone: telefoneInput.value,
        tipoUsuario: document.getElementById('is-rh').checked ? 2 : 1,
        escolaridade: escolaridadeInput.value,
        enderecoId: idEndereco,
        dtNasc: formatarDataParaEnvio(dtNascInput.value)
    };

    console.log('Dados do usuário:', JSON.stringify(usuario));

    try {
        const response = await fetch('http://localhost:8080/usuarios/cadastro', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            // Se a resposta não for ok, exiba uma mensagem genérica
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Erro ao realizar cadastro';
            console.error('Erro ao realizar cadastro', response.status, errorMessage);
            showAlert('error', errorMessage);
            return null;
        }

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.status === 201) {
            console.log('Cadastro bem sucedido');
            showAlert('success', 'Cadastro realizado com sucesso!');
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
            return data.idUsuario;
        } else {
            console.error('Erro inesperado', response.status);
            showAlert('error', 'Erro ao realizar cadastro');
            return null;
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao tentar fazer cadastro');
        return null;
    }
}

function formatarCep() {
    const cepFormatar = document.getElementById('cep');
    var cepFormatado = cepFormatar.value.replace(/\D/g, '');

    if (cepFormatado.length >= 5) {
        cepFormatado = cepFormatado.substring(0, 5) + '-' + cepFormatado.substring(5);
    }

    cepFormatar.value = cepFormatado;
}

document.getElementById('cep').addEventListener('input', function () {
    formatarCep();
    buscarCep();
});

function formatarCpf() {
    const cpfFormatar = document.getElementById('cpf');
    var cpfFormatado = cpfFormatar.value.replace(/\D/g, '');

    if (cpfFormatado.length <= 3) {
        cpfFormatado = cpfFormatado.replace(/(\d{1,3})/, '$1');
    } else if (cpfFormatado.length <= 6) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (cpfFormatado.length <= 9) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpfFormatado.length <= 11) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    cpfFormatar.value = cpfFormatado;
}

function formatarCnpj() {
    const cnpjFormatar = document.getElementById('cnpj');
    let cnpjFormatado = cnpjFormatar.value.replace(/\D/g, '');

    if (cnpjFormatado.length <= 2) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{1,2})/, '$1');
    } else if (cnpjFormatado.length <= 5) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    } else if (cnpjFormatado.length <= 8) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cnpjFormatado.length <= 12) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    } else if (cnpjFormatado.length <= 14) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    }

    cnpjFormatar.value = cnpjFormatado;
}

function formatarTelefone() {
    const telefoneFormatar = document.getElementById('telefone');
    let telefoneFormatado = telefoneFormatar.value.replace(/\D/g, '');

    if (telefoneFormatado.length <= 2) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{1,2})/, '($1');
    } else if (telefoneFormatado.length <= 6) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{1,4})/, '($1)$2');
    } else if (telefoneFormatado.length <= 10) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1)$2-$3');
    } else if (telefoneFormatado.length <= 11) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
    }

    telefoneFormatar.value = telefoneFormatado;
}

function buscarCep() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    if (cep.length === 8) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Dados do CEP:', data); // Adicione este log para verificar a resposta da API
                if (data.erro) {
                    showAlert('error', 'CEP não encontrado');
                } else {
                    // Verifique se os dados existem e são válidos
                    document.getElementById('street').value = data.logradouro || '';
                    document.getElementById('city').value = data.localidade || '';
                    document.getElementById('state').value = data.uf || '';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                showAlert('error', 'Erro ao buscar CEP');
            });
    }
}


function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `container_alerta ${type} show`;

    const alertTitle = document.createElement('span');
    alertTitle.className = 'titulo_alerta';
    alertTitle.textContent = type === 'error' ? 'Erro!' : 'Sucesso!';

    const alertText = document.createElement('span');
    alertText.className = 'texto_alerta';
    alertText.textContent = message;

    alertContainer.appendChild(alertTitle);
    alertContainer.appendChild(alertText);

    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            alertContainer.remove();
        }, 500); // Tempo para garantir que a animação de saída aconteça
    }, 3000); // Tempo para o alerta permanecer visível
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            realizarCadastro();
        });
    }
});

document.getElementById('dataNascimento').addEventListener('input', formatarDataNascimento);
