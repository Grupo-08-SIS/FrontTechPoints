async function realizarCadastro() {
    const enderecoId = await cadastrarEndereco();
    if (enderecoId !== null) {
        await cadastrarUsuario(enderecoId); // Usar await para garantir a execução completa antes de prosseguir
    } else {
        console.error('Erro ao cadastrar endereço');
    }
}

async function cadastrarEndereco() {
    const logradouro = document.getElementById('street').value;
    const cidade = document.getElementById('city').value;
    const estado = document.getElementById('state').value;
    const cep = document.getElementById('cep').value;

    const endereco = {
        cep: cep,
        cidade: cidade,
        estado: estado,
        rua: logradouro
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
        } else if (response.status === 400) {
            console.error('Erro ao cadastrar endereço: Requisição inválida');
            return null;
        } else if (response.status === 500) {
            console.error('Erro interno do servidor ao tentar cadastrar endereço');
            return null;
        } else {
            console.error('Erro ao cadastrar endereço', response.status);
            return null;
        }
    } catch (error) {
        console.error('Erro ao enviar requisição:', error);
        return null;
    }
}

async function cadastrarUsuario(idEndereco) {
    const nomeUsuario = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const primeiroNome = document.getElementById('firstname').value;
    const sobrenome = document.getElementById('lastname').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); 
    const isRH = document.getElementById('is-rh').checked;
    const tipoUsuario = isRH ? 3 : 2;

    const usuario = {
        nomeUsuario: nomeUsuario,
        email: email,
        senha: senha,
        primeiroNome: primeiroNome,
        sobrenome: sobrenome,
        cpf: cpf,
        idEndereco: idEndereco,
        idTipo: tipoUsuario
    };

    try {
        const response = await fetch('http://localhost:8080/usuarios/cadastro', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.status === 201) {
            console.log('Cadastro bem sucedido');
        
            window.location.href = '/dashboard'; //redirecionar futuramente para a tela de dash
        } else if (response.status === 400) {
            console.error('Erro ao realizar cadastro: Email já cadastrado');
        } else if (response.status === 500) {
            console.error('Erro interno do servidor ao tentar fazer cadastro');
        } else {
            console.error('Erro ao tentar fazer cadastro', response.status);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar fazer cadastro');
    }
}


function formatarCep() {
    const cepFormatar = document.getElementById('cep');
    var cepFormatado = cepFormatar.value.replace(/\D/g, '')

    if (cepFormatado.length >= 5) {
        cepFormatado = cepFormatado.substring(0, 5) + '-' + cepFormatado.substring(5)
    }

    cepFormatar.value = cepFormatado;
}

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

function buscarCep() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value;
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    if (cep.length >= 8) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    console.error('CEP não encontrado');
                    return;
                }
                
                const logradouro = data.logradouro;
                const estado = data.uf;
                const bairro = data.bairro;
                const cidade = data.localidade;

                document.getElementById('street').value = logradouro;
                document.getElementById('state').value = estado;
                document.getElementById('city').value = cidade;
                document.getElementById('neighborhood').value = bairro;

                document.getElementById('logradouroDisplay').innerHTML = `Rua: ${logradouro}`;
                document.getElementById('estadoDisplay').innerHTML = `Estado: ${estado}`;
                document.getElementById('cidadeDisplay').innerHTML = `Cidade: ${cidade}`;
                document.getElementById('bairroDisplay').innerHTML = `Bairro: ${bairro}`;
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
            });
    }
}
