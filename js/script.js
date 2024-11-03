document.addEventListener("DOMContentLoaded", function () {
  // Definindo variáveis e selecionando elementos
  const profileTab = document.getElementById("shape1");
  const personalTab = document.getElementById("shape2");
  const tabs = [profileTab, personalTab];
  const profileData = document.getElementById("step1");
  const personalData = document.getElementById("step2");
  const continueBtn = document.querySelector(".continue-btn");
  const backBtn = document.querySelector(".back-btn");
  const profileCheck = document.getElementById("check1");
  const termsLink = document.getElementById("terms-link");
  const helpBtn = document.querySelector(".help-btn");
  const infoModal = document.getElementById("info-modal");
  const closeInfoModal = document.querySelector("#info-modal .close");

  // Funções de validação
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6;
  }

  function validarApelido(apelido) {
    const regex = /^\D+$/; // Apenas letras permitidas
    return regex.test(apelido);
  }

  function validarCampos(username, email, password, selectedType) {
    if (!username || !email || !password || selectedType == '') {
      showAlert("error", "Todos os campos devem ser preenchidos.");
      return false;
    }
    if (!validarApelido(username)) {
      showAlert("error", "O apelido não pode conter números.");
      return false;
    }
    if (!validarEmail(email)) {
      showAlert("error", "O email deve ser válido (ex: exemplo@dominio.com).");
      return false;
    }
    if (!validarSenha(password)) {
      showAlert("error", "A senha deve ter pelo menos 6 dígitos.");
      return false;
    }
    return true;
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
      }, 500);
    }, 3000);
  }

  // Controle da navegação das abas
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      if (tab.id === "shape2" && profileCheck.style.display !== "flex") {
        showAlert("error", "Preencha os dados do perfil antes de continuar.");
        return;
      }
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      profileData.style.display = tab.id === "shape1" ? "block" : "none";
      personalData.style.display = tab.id === "shape2" ? "block" : "none";
    });
  });

  // Controle do botão "Continuar"
  continueBtn.addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const selectedType = document.getElementById("user-type").value;

    if (validarCampos(username, email, password, selectedType)) {
        // Ocultar todas as seções primeiro
        document.getElementById("recrutador").style.display = "none";
       // document.getElementById("empresa").style.display = "none";

        if (selectedType === "aluno") {
            personalData.style.display = "block"; // Exibe dados pessoais do Aluno
        } else if (selectedType === "recrutador") {
            document.getElementById("recrutador").style.display = "block"; // Exibe dados do Recrutador
        } else if (selectedType === "empresa") {
            document.getElementById("empresa").style.display = "block"; // Exibe dados da Empresa
        }

        profileData.style.display = "none"; // Oculte a seção de perfil geral
    }
});


  // Controle do botão "Voltar"
  backBtn.addEventListener("click", function () {
    profileTab.classList.add("active");
    personalTab.classList.remove("active");
    profileData.style.display = "block";
    personalData.style.display = "none";
  });

  // Modais e outros eventos
  termsLink.addEventListener("click", function () {
    const termsModal = document.getElementById("terms-modal");
    const closeTermsModal = document.querySelector("#terms-modal .close");

    termsModal.style.display = "block";

    closeTermsModal.addEventListener("click", function () {
      termsModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target == termsModal) {
        termsModal.style.display = "none";
      }
    });
  });

  helpBtn.addEventListener("click", function () {
    infoModal.style.display = "block";
  });

  closeInfoModal.addEventListener("click", function () {
    infoModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target == infoModal) {
      infoModal.style.display = "none";
    }
  });

  document.querySelectorAll(".back-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("step1").style.display = "block";
      document.getElementById("aluno").style.display = "none";
      document.getElementById("recrutador").style.display = "none";
    });
  });
});
