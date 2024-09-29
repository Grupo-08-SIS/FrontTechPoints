async function realizarCadastro() {
    // Verifica se todos os campos obrigatórios estão preenchidos antes de iniciar o cadastro
    const todosCamposValidos = validarCampos();
    if (!todosCamposValidos) {
        showAlert('error', 'Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Cadastra o endereço e aguarda a resposta
    const enderecoId = await cadastrarEndereco();
    if (enderecoId === null) {
        return; // Se houve erro no cadastro do endereço, não prossegue
    }

    const isRH = window.location.pathname.includes('cadastro_rh');
    const tipoUsuario = isRH ? 3 : 2;

    // Cadastra o usuário e aguarda a resposta
    const id = await cadastrarUsuario(enderecoId);
    if (id != null) {
        showAlert('success', 'Cadastro realizado com sucesso!');

        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
        await realizarLoginAutomatico(email, senha);
    }

}

function validarCampos() {
    // Obtém valores dos campos
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
    const sexoInput = document.getElementById('sexo').value;
    const corInput = document.getElementById('cor_raca').value;
    const dtNascInput = document.getElementById('dataNascimento').value;

    // Verifica se todos os campos obrigatórios estão preenchidos
    return logradouro && numero && cidade && estado && cep &&
        usernameInput && emailInput && passwordInput &&
        firstnameInput && lastnameInput && cpfInput &&
        telefoneInput && escolaridadeInput && dtNascInput &&
        sexoInput && corInput;
}

async function cadastrarEndereco() {
    const logradouro = document.getElementById('street').value;
    const numero = document.getElementById('number').value;
    const cidade = document.getElementById('city').value;
    const estado = document.getElementById('state').value;
    const cep = document.getElementById('cep').value;

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
        if (response.status === 201) {
            return data.id;
        } else {
            showAlert('error', `Erro ao cadastrar endereço: ${data.message}`);
            return null;
        }
    } catch (error) {
        showAlert('error', 'Erro ao tentar cadastrar o endereço');
        return null;
    }
}

let timeoutId;

function formatarDataNascimento(event) {
    const dataInput = event.target;
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

    dataInput.value = dataFormatada;

    if (dataInput.value.length > 10) {
        dataInput.value = dataInput.value.slice(0, 10);
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        validarDataEAtualizarCampo(dataInput);
    }, 1000);
}

function validarDataEAtualizarCampo(input) {
    if (!validarData(input.value)) {
        showAlert('error', 'Data inválida. Por favor, insira uma data válida no formato DD/MM/AAAA.');
        input.value = '';
    }
}

function validarData(data) {
    const partes = data.split('/');
    if (partes.length !== 3) {
        return false;
    }
    const [dia, mes, ano] = partes.map(part => parseInt(part, 10));

    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        return false;
    }

    if ((mes === 4 || mes === 6 || mes === 9 || mes === 11) && dia > 30) {
        return false;
    }
    if (mes === 2) {
        const isBissexto = (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0));
        if ((isBissexto && dia > 29) || (!isBissexto && dia > 28)) {
            return false;
        }
    }

    return true;
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
    const sexoInput = document.getElementById('sexo');
    const corInput = document.getElementById('cor_raca');
    const dtNascInput = document.getElementById('dataNascimento');

    // Formatar e validar CPF
    const cpf = cpfInput.value.replace(/\D/g, '');
    if (!validarCPF(cpf)) {
        showAlert('error', 'CPF inválido. Por favor, insira um CPF válido.');
        return;
    }

    // Formatar e validar telefone
    const telefone = telefoneInput.value.replace(/\D/g, '');
    if (!validarTelefone(telefone)) {
        showAlert('error', 'Telefone inválido. Por favor, insira um telefone válido.');
        return;
    }

    // Validar a data de nascimento antes de formatar
    const dataNascimento = formatarDataParaEnvio(dtNascInput.value);
    if (!dataNascimento) {
        showAlert('error', 'Data de nascimento inválida. Por favor, insira uma data válida.');
        return;
    }

    // Mapear os valores do sexo e cor ou raça para o formato desejado
    const sexoMap = {
        "sexo_masculino": "Masculino",
        "sexo_feminino": "Feminino"
    };
    
    const corMap = {
        "opc_cor_branco": "Branco",
        "opc_cor_preto": "Preto",
        "opc_cor_pardo": "Pardo",
        "opc_cor_amarelo": "Amarelo",
        "opc_cor_indigeno": "Indígena"
    };

    const usuario = {
        nomeUsuario: usernameInput.value,
        cpf: cpf, 
        senha: passwordInput.value,
        primeiroNome: firstnameInput.value,
        sobrenome: lastnameInput.value,
        email: emailInput.value,
        telefone: telefone,
        tipoUsuario: document.getElementById('is-rh').checked ? 2 : 1,
        escolaridade: escolaridadeInput.value,
        sexo: sexoMap[sexoInput.value],  // Mapeando o valor do sexo para o formato correto
        cor: corMap[corInput.value],  // Mapeando o valor de cor/raça para o formato correto
        enderecoId: idEndereco,
        dtNasc: dataNascimento 
    };

    try {
        const response = await fetch('http://localhost:8080/usuarios/cadastro', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        if (response.ok) {
            const data = await response.json();
            showAlert('success', 'Cadastro realizado com sucesso!');
            return data.id;
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

async function realizarLoginAutomatico(email, senha) {
    try {
        console.log('Tentando fazer login automaticamente com:', email);

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

        if (data.id) {
            // Sucesso no login
            data.senha = senha;
            sessionStorage.setItem('user', JSON.stringify(data));
            console.log('Login bem-sucedido, usuário armazenado no sessionStorage');

            if (!data.deletado) {

                switch (data.tipoUsuario) {
                    case "Aluno":
                        console.log('Redirecionando para dash_aluno.html');
                        window.location.href = 'dash_aluno.html';
                        break;
                    case "Recrutador":
                        console.log('Redirecionando para tela_rh_vagas.html');
                        window.location.href = 'tela_rh_vagas.html';
                        break;
                    default:
                        showAlert('error', 'Erro: Tipo de usuário desconhecido');
                        console.error('Tipo de usuário desconhecido');
                }
            } else {
                showAlert('success', 'Sua conta está sendo reativada!');
            }
        } else {
            showAlert('error', 'Email ou senha incorretos');
        }
    } catch (error) {
        showAlert('error', 'Erro ao tentar fazer login');
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

function formatarCPF(event) {
    const cpfInput = event.target;
    let cpfFormatado = cpfInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Adiciona a máscara de CPF
    if (cpfFormatado.length <= 3) {
        cpfFormatado = cpfFormatado.replace(/(\d{1,3})/, '$1');
    } else if (cpfFormatado.length <= 6) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (cpfFormatado.length <= 9) {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
        cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    // Atualiza o valor do input com a formatação aplicada
    cpfInput.value = cpfFormatado;

    // Limita o comprimento do campo
    if (cpfInput.value.length > 14) {
        cpfInput.value = cpfInput.value.slice(0, 14);
    }

    // Valida o CPF formatado
    if (!validarCPF(cpfInput.value)) {
        showAlert('error', 'CPF inválido. Por favor, insira um CPF válido.');
    }else {
        showAlert("sucess","Cpf válido. Sucesso, Cpf inserido é válido")
    }
}

function validarCPF(cpf) {
    // Remove caracteres não numéricos
    const cpfNumeros = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpfNumeros.length !== 11 || /^(\d)\1{10}$/.test(cpfNumeros)) {
        return false;
    }

    // Valida os dígitos verificadores
    let soma = 0;
    let digito;
    
    // Validação do primeiro dígito
    for (let i = 0; i < 9; i++) {
        soma += cpfNumeros[i] * (10 - i);
    }
    digito = (soma * 10) % 11;
    if (digito === 10 || digito === 11) digito = 0;
    if (digito !== parseInt(cpfNumeros[9], 10)) return false;

    // Validação do segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += cpfNumeros[i] * (11 - i);
    }
    digito = (soma * 10) % 11;
    if (digito === 10 || digito === 11) digito = 0;
    if (digito !== parseInt(cpfNumeros[10], 10)) return false;

    return true;
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

function formatarTelefone(event) {
    const telefoneInput = event.target;
    let telefoneFormatado = telefoneInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Adiciona a máscara de telefone
    if (telefoneFormatado.length <= 2) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{1,2})/, '($1');
    } else if (telefoneFormatado.length <= 7) {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    } else {
        telefoneFormatado = telefoneFormatado.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    }

    // Atualiza o valor do input com a formatação aplicada
    telefoneInput.value = telefoneFormatado;

    // Limita o comprimento do campo
    if (telefoneInput.value.length > 15) {
        telefoneInput.value = telefoneInput.value.slice(0, 15);
    }

    // Valida o telefone formatado
    if (!validarTelefone(telefoneInput.value)) {
        showAlert('error', 'Telefone inválido. Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX.');
    } else {
        showAlert("sucess", "Telefone válido. Sucesso, o telefone foi inserido em um formato válido!")
    }
}

function validarTelefone(telefone) {
    // Remove caracteres não numéricos
    const telefoneNumeros = telefone.replace(/\D/g, '');

    // Verifica se o telefone tem 10 ou 11 dígitos
    return telefoneNumeros.length === 10 || telefoneNumeros.length === 11;
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

function formatarCnpj(event) {
    const cnpjInput = event.target;
    let cnpjFormatado = cnpjInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Adiciona a máscara de CNPJ
    if (cnpjFormatado.length <= 2) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{1,2})/, '$1');
    } else if (cnpjFormatado.length <= 5) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    } else if (cnpjFormatado.length <= 8) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cnpjFormatado.length <= 12) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    } else {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    }

    // Atualiza o valor do input com a formatação aplicada
    cnpjInput.value = cnpjFormatado;

    // Limita o comprimento do campo
    if (cnpjInput.value.length > 18) {
        cnpjInput.value = cnpjInput.value.slice(0, 18);
    }

    // Valida o CNPJ formatado
    if (!validarCNPJ(cnpjInput.value)) {
        showAlert('error', 'CNPJ inválido. Por favor, insira um CNPJ válido.');
    }
}

function validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    const cnpjNumeros = cnpj.replace(/\D/g, '');

    // Verifica se tem 14 dígitos
    if (cnpjNumeros.length !== 14) {
        return false;
    }

    // Validação do CNPJ
    let tamanho = cnpjNumeros.length - 2;
    let numeros = cnpjNumeros.substring(0, tamanho);
    let digitos = cnpjNumeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpjNumeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
        return false;
    }

    return true;
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
        }, 3000); // Tempo para garantir que a animação de saída aconteça
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

document.getElementById('cpf').addEventListener('input', formatarCPF);
document.getElementById('telefone').addEventListener('input', formatarTelefone);
document.getElementById('dataNascimento').addEventListener('input', formatarDataNascimento);
document.getElementById('cep').addEventListener('input', function () {
    formatarCep();
    buscarCep();
});
