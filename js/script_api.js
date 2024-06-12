async function realizarCadastro() {
    const enderecoId = await cadastrarEndereco();
    const isRH = window.location.pathname.includes('cadastro_rh');
    const tipoUsuario = isRH ? 3 : 2;


    if (enderecoId !== null) {
        
        const id = await cadastrarUsuario(enderecoId)
        
        if (tipoUsuario == 3) {
            await cadastrarDadosEmpresa(id)
        } 
    } else console.error('Erro ao cadastrar endereço')
    
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
            if(tipoUsuario != 3){
                return data.idUsuario
            }
            return data.idUsuario, window.location = '/html/home.html';
        } else if (response.status === 400) {
            console.error('Erro ao realizar cadastro: Email já cadastrado');
        } else if (response.status === 500) {
            console.error('Erro interno do servidor ao tentar fazer cadastro');
        } else {
            console.error('Erro ao tentar fazer cadastro', response.status);
        }
        return null;
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar fazer cadastro');
        return null;
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
    const telefoneFormatar = document.getElementById('corporate-phone');
    let telefoneFormatado = telefoneFormatar.value.replace(/\D/g, ''); 

    if (telefoneFormatado.length <= 2) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{1,2})/, '($1');
    } else if (telefoneFormatado.length <= 6) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{1,4})/, '($1)$2');
    } else if (telefoneFormatado.length <= 10) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1)$2-$3');
    } else if (telefoneFormatado.length <= 11) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1)$2-$3');
    }

    telefoneFormatar.value = telefoneFormatado;
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

async function cadastrarDadosEmpresa(id) {
    const nomeEmpresa = document.getElementById('company-name').value.trim();
    const setorIndustria = document.getElementById('industry-sector').value.trim();
    const cargoUsuario = document.getElementById('user-role').value.trim();
    const cnpj = document.getElementById('cnpj').value.replace(/\D/g, '').trim();
    const emailCorporativo = document.getElementById('email').value.trim();
    const telefoneCorporativo = document.getElementById('corporate-phone').value.replace(/\D/g, '').trim();

    const dadosEmpresa = {
        nomeEmpresa: nomeEmpresa,
        setorIndustria: setorIndustria,
        cargoUsuario: cargoUsuario,
        cnpj: cnpj,
        emailCorporativo: emailCorporativo,
        telefoneContato: telefoneCorporativo,
        idUsuario: id 
    };

    console.log('Dados enviados:', dadosEmpresa); 

    try {
        const response = await fetch('http://localhost:8080/empresa/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosEmpresa)
        });

        const data = await response.json(); 

        if (response.ok) {
            console.log('Resposta do servidor:', data);
            if (response.status === 201) {
                console.log('Empresa cadastrada com sucesso');
                window.location.href = '/html/home.html'; 
            } else {
                console.error('Erro ao cadastrar empresa:', data.message);
                alert(`Erro ao cadastrar empresa: ${data.message}`);
            }
        } else if (response.status === 400) {
            console.error('Erro de validação dos dados:', data.message);
            alert(`Erro de validação dos dados: ${data.message}`);
        } else if (response.status === 500) {
            console.error('Erro interno do servidor');
            alert('Erro interno do servidor');
        } else {
            console.error('Erro desconhecido:', response.status);
            alert(`Erro desconhecido: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao enviar requisição:', error);
        alert('Erro ao tentar cadastrar empresa');
    }
}


