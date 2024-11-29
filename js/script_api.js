const tipoUsuarioEnum = {
  Aluno: 1,
  Recrutador: 2,
  Empresa: 3,
};

function buscarTipoUsuario() {
  const userType = document.getElementById("userType").value;
  switch (userType) {
    case "aluno":
      return tipoUsuarioEnum.Aluno;
    case "recrutador":
      return tipoUsuarioEnum.Recrutador;
    case "empresa":
      return tipoUsuarioEnum.Empresa;
    default:
      showAlert("error", "Tipo de usuário inválido. Selecione um tipo válido.");
      throw new Error("Tipo de usuário inválido.");
  }
}

function validarCampos() {
  const tipoUsuario = buscarTipoUsuario();
  const campos = {
    1: [
      "street",
      "number",
      "city",
      "state",
      "cep",
      "username",
      "email",
      "password",
      "firstname",
      "lastname",
      "cpf",
      "telefone",
      "escolaridade",
      "sexo",
      "etnia",
      "dataNascimento",
    ],
    2: [
      "usernameRecruiter",
      "recruiterEmail",
      "passwordRecruiter",
      "firstnameRecruiter",
      "lastnameRecruiter",
      "cpfRecruiter",
      "telefoneRecruiter",
      "cnpjRecruiter",
      "cargoUsuario",
      "companyRecruiter",
    ],
    3: [
      "companyName",
      "cnpjCompany",
      "telefoneCompany",
      "companyEmail",
      "passwordCompany",
      "firstnameCompany",
      "lastnameCompany",
      "setorIndustria",
      "streetCompany",
      "numberCompany",
      "cityCompany",
      "stateCompany",
      "cepCompany",
    ],
  };

  return campos[tipoUsuario].every((id) => document.getElementById(id).value);
}

async function realizarCadastro() {
  const todosCamposValidos = validarCampos();
  if (!todosCamposValidos) {
    showAlert("error", "Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const tipoUsuario = buscarTipoUsuario();
  let enderecoId = 0;
  if (tipoUsuario === 1 || tipoUsuario === 3) {
    enderecoId = await cadastrarEndereco(tipoUsuario);
    if (enderecoId === null) return;
  }

  const id = await cadastrarUsuario(enderecoId, tipoUsuario);
  if (id != null) {
    if (tipoUsuario === 1) {
      showAlert("success", "Cadastro realizado com sucesso!");
      const email = document.getElementById("email").value;
      const senha = document.getElementById("password").value;
      await realizarLoginAutomatico(email, senha);
    } else if (tipoUsuario === 2) {
      showAlert("success", "Cadastro realizado com sucesso!");
      const email = document.getElementById("recruiterEmail").value;
      const senha = document.getElementById("passwordRecruiter").value;
      await realizarLoginAutomatico(email, senha);
    } else {
      showAlert("success", "Cadastro realizado com sucesso!");
      const email = document.getElementById("companyEmail").value;
      const senha = document.getElementById("passwordCompany").value;
      await realizarLoginAutomaticoEmpresa(email, senha);
    }
  }
}

async function cadastrarEndereco(tipoUsuario) {
  const endereco = {
    1: {
      cep: document.getElementById("cep").value,
      cidade: document.getElementById("city").value,
      estado: document.getElementById("state").value,
      rua: document.getElementById("street").value,
      numero: document.getElementById("number").value,
    },
    3: {
      cep: document.getElementById("cepCompany").value,
      cidade: document.getElementById("cityCompany").value,
      estado: document.getElementById("stateCompany").value,
      rua: document.getElementById("streetCompany").value,
      numero: document.getElementById("numberCompany").value,
    },
  };

  try {
    const response = await fetch("http://localhost:8080/enderecos/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endereco[tipoUsuario]),
    });

    const data = await response.json();
    if (response.status === 201) return data.id;
    showAlert("error", `Erro ao cadastrar endereço: ${data.message}`);
    return null;
  } catch {
    showAlert("error", "Erro ao tentar cadastrar o endereço");
    return null;
  }
}

async function cadastrarUsuario(idEndereco, tipoUsuario) {
  const camposEspecificos = {
    1: {
      nomeUsuario: document.getElementById("username").value,
      senha: document.getElementById("password").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      cpf: document.getElementById("cpf").value,
      primeiroNome: document.getElementById("firstname").value,
      sobrenome: document.getElementById("lastname").value,
      escolaridade: document.getElementById("escolaridade").value,
      sexo: document.getElementById("sexo").value,
      etnia: document.getElementById("etnia").value,
      enderecoId: idEndereco,
      dtNasc: document.getElementById("dataNascimento").value,
    },
    2: {
      nomeUsuario: document.getElementById("usernameRecruiter").value,
      senha: document.getElementById("passwordRecruiter").value,
      email: document.getElementById("recruiterEmail").value,
      telefone: document.getElementById("telefoneRecruiter").value,
      cpf: document.getElementById("cpfRecruiter").value,
      primeiroNome: document.getElementById("firstnameRecruiter").value,
      sobrenome: document.getElementById("lastnameRecruiter").value,
      cnpj: document.getElementById("cnpjRecruiter").value,
      cargo: document.getElementById("cargoUsuario").value,
      empresa: document.getElementById("companyRecruiter").value,
    },
    3: {
      nomeEmpresa: document.getElementById("companyName").value,
      cnpj: document.getElementById("cnpjCompany").value,
      emailCorporativo: document.getElementById("companyEmail").value,
      senhaRepresante: document.getElementById("passwordCompany").value,
      telefoneContato: document.getElementById("telefoneCompany").value,
      representanteLegal: document.getElementById("firstnameCompany").value,
      sobrenomeRepresentante: document.getElementById("lastnameCompany").value,
      setorIndustria: document.getElementById("setorIndustria").value,
      enderecoId: idEndereco,
    },
  };
  // TODO: Falta conseguir cadastrar o recrutador
  console.log(camposEspecificos[tipoUsuario]);

  const usuario = {
    ...camposEspecificos[tipoUsuario],
    tipoUsuario,
  };

  try {
    if (tipoUsuario !== 3) {
      const response = await fetch("http://localhost:8080/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.message || "Erro ao realizar cadastro");
        return null;
      }
    } else {
      const response = await fetch("http://localhost:8080/empresa/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.message || "Erro ao realizar cadastro");
        return null;
      }
    }
  } catch {
    showAlert("error", "Erro ao tentar fazer cadastro");
    return null;
  }
}

async function realizarLoginAutomatico(email, senha) {
  try {
    const response = await fetch("http://localhost:8080/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) throw new Error("Erro ao tentar fazer login");

    const data = await response.json();
    if (data.id) {
      sessionStorage.setItem("user", JSON.stringify(data));
      window.location.href =
        data.tipoUsuario === "Aluno" ? "dash_aluno.html" : "tela_rh_vagas.html";
    } else {
      showAlert("error", "Email ou senha incorretos");
    }
  } catch {
    showAlert("error", "Erro ao tentar fazer login");
  }
}
function buscarCep() {
  const cepInputs = ["cep", "cepCompany"];
  cepInputs.forEach((cepId) => {
    const cepInput = document.getElementById(cepId);
    if (cepInput) {
      const cep = cepInput.value.replace(/\D/g, "");
      const url = `https://viacep.com.br/ws/${cep}/json/`;

      if (cep.length === 8) {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log("Dados do CEP:", data);
            if (data.erro) {
              showAlert("error", "CEP não encontrado");
            } else {
              if (cepId === "cep") {
                document.getElementById("street").value = data.logradouro || "";
                document.getElementById("city").value = data.localidade || "";
                document.getElementById("state").value = data.uf || "";
              } else if (cepId === "cepCompany") {
                document.getElementById("streetCompany").value =
                  data.logradouro || "";
                document.getElementById("cityCompany").value =
                  data.localidade || "";
                document.getElementById("stateCompany").value = data.uf || "";
              }
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar CEP:", error);
            showAlert("error", "Erro ao buscar CEP");
          });
      }
    }
  });
}

function formatarCep(event) {
  const cepInput = event.target;
  let cepFormatado = cepInput.value.replace(/\D/g, "");

  if (cepFormatado.length >= 5) {
    cepFormatado =
      cepFormatado.substring(0, 5) + "-" + cepFormatado.substring(5);
  }

  cepInput.value = cepFormatado;
}

if (document.getElementById("cep")) {
  document.getElementById("cep").addEventListener("input", function () {
    formatarCep(event);
    buscarCep();
  });
} else {
  document.getElementById("cepCompany").addEventListener("input", function () {
    formatarCep(event);
    buscarCep();
  });
}

function formatarCPF(event) {
  const cpfInput = event.target;
  let cpfFormatado = cpfInput.value.replace(/\D/g, "");

  if (cpfFormatado.length <= 3) {
    cpfFormatado = cpfFormatado.replace(/(\d{1,3})/, "$1");
  } else if (cpfFormatado.length <= 6) {
    cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  } else if (cpfFormatado.length <= 9) {
    cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else {
    cpfFormatado = cpfFormatado.replace(
      /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
      "$1.$2.$3-$4"
    );
  }

  cpfInput.value = cpfFormatado;

  if (cpfInput.value.length > 14) {
    cpfInput.value = cpfInput.value.slice(0, 14);
  }

  if (!validarCPF(cpfInput.value)) {
    showAlert("error", "CPF inválido. Por favor, insira um CPF válido.");
  } else {
    showAlert("success", "CPF válido. Sucesso, CPF inserido é válido");
  }
}

function validarCPF(cpf) {
  const cpfNumeros = cpf.replace(/\D/g, "");

  if (cpfNumeros.length !== 11 || /^(\d)\1{10}$/.test(cpfNumeros)) {
    return false;
  }

  let soma = 0;
  let digito;

  for (let i = 0; i < 9; i++) {
    soma += cpfNumeros[i] * (10 - i);
  }
  digito = (soma * 10) % 11;
  if (digito === 10 || digito === 11) digito = 0;
  if (digito !== parseInt(cpfNumeros[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += cpfNumeros[i] * (11 - i);
  }
  digito = (soma * 10) % 11;
  if (digito === 10 || digito === 11) digito = 0;
  if (digito !== parseInt(cpfNumeros[10], 10)) return false;

  return true;
}

function formatarDataNascimento(event) {
  const dataInput = event.target;
  let dataFormatada = dataInput.value.replace(/\D/g, "");

  if (dataFormatada.length <= 2) {
    dataFormatada = dataFormatada.replace(/(\d{1,2})/, "$1");
  } else if (dataFormatada.length <= 4) {
    dataFormatada = dataFormatada.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  } else if (dataFormatada.length <= 8) {
    dataFormatada = dataFormatada.replace(
      /(\d{2})(\d{2})(\d{1,4})/,
      "$1/$2/$3"
    );
  } else {
    dataFormatada = dataFormatada.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
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
    showAlert(
      "error",
      "Data inválida. Por favor, insira uma data válida no formato DD/MM/AAAA."
    );
    input.value = "";
  }
}

function validarData(data) {
  const partes = data.split("/");
  if (partes.length !== 3) {
    return false;
  }
  const [dia, mes, ano] = partes.map((part) => parseInt(part, 10));

  if (
    isNaN(dia) ||
    isNaN(mes) ||
    isNaN(ano) ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31
  ) {
    return false;
  }

  if ((mes === 4 || mes === 6 || mes === 9 || mes === 11) && dia > 30) {
    return false;
  }
  if (mes === 2) {
    const isBissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
    if ((isBissexto && dia > 29) || (!isBissexto && dia > 28)) {
      return false;
    }
  }

  return true;
}

function formatarDataParaEnvio(data) {
  const partes = data.split("/");
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, "0");
    const mes = partes[1].padStart(2, "0");
    const ano = partes[2];
    return `${ano}-${mes}-${dia}`;
  }
  return "";
}

function showAlert(type, message) {
  const alertContainer = document.createElement("div");
  alertContainer.className = `container_alerta ${type} show`;

  const alertTitle = document.createElement("span");
  alertTitle.className = "titulo_alerta";
  alertTitle.textContent = type === "error" ? "Erro!" : "Sucesso!";

  const alertText = document.createElement("span");
  alertText.className = "texto_alerta";
  alertText.textContent = message;

  alertContainer.appendChild(alertTitle);
  alertContainer.appendChild(alertText);

  document.body.appendChild(alertContainer);

  setTimeout(() => {
    alertContainer.classList.remove("show");
    setTimeout(() => {
      alertContainer.remove();
    }, 3000);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      realizarCadastro();
    });
  }
});

document.getElementById("cpf").addEventListener("input", formatarCPF);
document.getElementById("telefone").addEventListener("input", formatarTelefone);
document
  .getElementById("dataNascimento")
  .addEventListener("input", formatarDataNascimento);
document.getElementById("cep").addEventListener("input", function () {
  formatarCep();
  buscarCep();
});
