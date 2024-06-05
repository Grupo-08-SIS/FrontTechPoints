document.addEventListener('DOMContentLoaded', function () {
    const profileTab = document.getElementById('shape1');
    const personalTab = document.getElementById('shape2');
    const companyTab = document.getElementById('shape3');
    const tabs = [profileTab, personalTab, companyTab];
    const profileData = document.getElementById('step1');
    const personalData = document.getElementById('step2');
    const companyData = document.getElementById('step3');
    const steps = [profileData, personalData, companyData];
    let currentStep = 0;

    const profileCheck = document.getElementById('check1');
    const termsLink = document.getElementById('terms-link');
    const registerForm = document.querySelector('form');
    const helpBtn = document.querySelector('.help-btn');
    const infoModal = document.getElementById('info-modal');
    const closeInfoModal = document.querySelector('#info-modal .close');

    function updateSteps() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.style.display = 'block';
                tabs[index].classList.remove('inactive');
            } else {
                step.style.display = 'none';
                tabs[index].classList.add('inactive');
            }
        });
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            if (validateForm()) {
                currentStep++;
                updateSteps();
            }
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateSteps();
        }
    }

    document.querySelectorAll('.continue-btn').forEach(btn => btn.addEventListener('click', nextStep));
    document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', prevStep));

    termsLink.addEventListener('click', function () {
        const termsModal = document.getElementById('terms-modal');
        const closeTermsModal = document.querySelector('#terms-modal .close');

        termsModal.style.display = 'block';

        closeTermsModal.addEventListener('click', function () {
            termsModal.style.display = 'none';
        });

        window.addEventListener('click', function (event) {
            if (event.target == termsModal) {
                termsModal.style.display = 'none';
            }
        });
    });

    helpBtn.addEventListener('click', function () {
        infoModal.style.display = 'block';
    });

    closeInfoModal.addEventListener('click', function () {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    });


    let slideIndex = 0;
    const slides = document.querySelectorAll('.image');
    const dots = document.querySelectorAll('.dot');
    const leftArrow = document.querySelector('.arrow-left1');
    const rightArrow = document.querySelector('.arrow-right1');

    function showSlide(n) {
        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }
        slides.forEach((slide, index) => {
            slide.style.display = (index + 1 === slideIndex) ? 'block' : 'none';
        });
        dots.forEach((dot, index) => {
            dot.className = dot.className.replace(' active', '');
            if (index + 1 === slideIndex) {
                dot.className += ' active';
            }
        });
    }

    function plusSlides(n) {
        showSlide(slideIndex += n);
    }

    leftArrow.addEventListener('click', function () {
        plusSlides(-1);
    });

    rightArrow.addEventListener('click', function () {
        plusSlides(1);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            currentSlide(index + 1);
        });
    });

    function currentSlide(n) {
        showSlide(slideIndex = n);
    }

    showSlide(slideIndex = 1);


    // function showError(input, message) {
    //     const errorMessage = document.createElement('span');
    //     errorMessage.classList.add('error-message');
    //     errorMessage.textContent = message;
    //     input.parentElement.appendChild(errorMessage);
    //     input.classList.add('input-error');
    //     errorMessage.style.display = 'block';

    //     setTimeout(() => {
    //         errorMessage.style.display = 'none';
    //         input.classList.remove('input-error');
    //         input.parentElement.removeChild(errorMessage);
    //     }, 3000);
    // }

    // function validateEmail(email) {
    //     const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    //     return re.test(email);
    // }

    // function validatePassword(password) {
    //     // Exemplo de validação: mínimo 6 caracteres
    //     return password.length >= 6;
    // }

    // function validateForm() {
    //     const fields = steps[currentStep].querySelectorAll('input[required]');
    //     let isValid = true;
        
    //     for (let i = 0; i < fields.length; i++) {
    //         const field = fields[i];
    //         if (!field.value) {
    //             showError(field, 'Este campo é obrigatório');
    //             isValid = false;
    //         } else if (field.id === 'email' && !validateEmail(field.value)) {
    //             showError(field, 'Digite um e-mail válido');
    //             isValid = false;
    //         } else if (field.id === 'password' && !validatePassword(field.value)) {
    //             showError(field, 'A senha deve ter no mínimo 6 caracteres');
    //             isValid = false;
    //         }
    //     }
    //     return isValid;
    // }

    // // Adicione os event listeners aos botões
    // document.querySelectorAll('.continue-btn').forEach(btn => btn.addEventListener('click', nextStep));
    // document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', prevStep));

    // // Função para avançar para o próximo passo
    // function nextStep() {
    //     if (currentStep < steps.length - 1) {
    //         if (validateForm()) {
    //             currentStep++;
    //             updateSteps();
    //         }
    //     }
    // }

    // // Função para voltar ao passo anterior
    // function prevStep() {
    //     if (currentStep > 0) {
    //         currentStep--;
    //         updateSteps();
    //     }
    // }

    // // Atualiza os passos conforme o estado atual
    // function updateSteps() {
    //     steps.forEach((step, index) => {
    //         if (index === currentStep) {
    //             step.style.display = 'block';
    //             tabs[index].classList.remove('inactive');
    //         } else {
    //             step.style.display = 'none';
    //             tabs[index].classList.add('inactive');
    //         }
    //     });
    // }

    // function validateEmail(email) {
    //     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return re.test(email);
    // }

    // function validateCPF(cpf) {
    //     cpf = cpf.replace(/[^\d]+/g,'');
    //     if(cpf == '') return false;
    //     // Eliminate invalid CPFs known.
    //     if (cpf.length !== 11 ||
    //         cpf === "00000000000" ||
    //         cpf === "11111111111" ||
    //         cpf === "22222222222" ||
    //         cpf === "33333333333" ||
    //         cpf === "44444444444" ||
    //         cpf === "55555555555" ||
    //         cpf === "66666666666" ||
    //         cpf === "77777777777" ||
    //         cpf === "88888888888" ||
    //         cpf === "99999999999")
    //         return false;
    //     // Validate the first digit.
    //     let add = 0;
    //     for (let i = 0; i < 9; i++)
    //         add += parseInt(cpf.charAt(i)) * (10 - i);
    //     let rev = 11 - (add % 11);
    //     if (rev == 10 || rev == 11)
    //         rev = 0;
    //     if (rev != parseInt(cpf.charAt(9)))
    //         return false;
    //     // Validate the second digit.
    //     add = 0;
    //     for (let i = 0; i < 10; i++)
    //         add += parseInt(cpf.charAt(i)) * (11 - i);
    //     rev = 11 - (add % 11);
    //     if (rev == 10 || rev == 11)
    //         rev = 0;
    //     if (rev != parseInt(cpf.charAt(10)))
    //         return false;
    //     return true;
    // }

    // function validateCNPJ(cnpj) {
    //     cnpj = cnpj.replace(/[^\d]+/g,'');

    //     if(cnpj == '') return false;

    //     if (cnpj.length != 14)
    //         return false;

    //     // Eliminate invalid CNPJs known.
    //     if (cnpj == "00000000000000" ||
    //         cnpj == "11111111111111" ||
    //         cnpj == "22222222222222" ||
    //         cnpj == "33333333333333" ||
    //         cnpj == "44444444444444" ||
    //         cnpj == "55555555555555" ||
    //         cnpj == "66666666666666" ||
    //         cnpj == "77777777777777" ||
    //         cnpj == "88888888888888" ||
    //         cnpj == "99999999999999")
    //         return false;

    //     // Validate DVs
    //     let length = cnpj.length - 2
    //     let numbers = cnpj.substring(0,length);
    //     let digits = cnpj.substring(length);
    //     let sum = 0;
    //     let pos = length - 7;
    //     for (let i = length; i >= 1; i--) {
    //         sum += numbers.charAt(length - i) * pos--;
    //         if (pos < 2)
    //             pos = 9;
    //     }
    //     let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    //     if (result != digits.charAt(0))
    //         return false;

    //     length = length + 1;
    //     numbers = cnpj.substring(0,length);
    //     sum = 0;
    //     pos = length - 7;
    //     for (let i = length; i >= 1; i--) {
    //         sum += numbers.charAt(length - i) * pos--;
    //         if (pos < 2)
    //             pos = 9;
    //     }
    //     result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    //     if (result != digits.charAt(1))
    //         return false;

    //     return true;
    // }

    // function validatePassword(password) {
    //     const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    //     return re.test(password);
    // }

    // function toggleValidation(input, isValid) {
    //     const validIcon = input.nextElementSibling;
    //     const invalidIcon = validIcon.nextElementSibling;

    //     if (isValid) {
    //         input.classList.add('valid');
    //         input.classList.remove('invalid');
    //         validIcon.style.display = 'inline';
    //         invalidIcon.style.display = 'none';
    //     } else {
    //         input.classList.add('invalid');
    //         input.classList.remove('valid');
    //         validIcon.style.display = 'none';
    //         invalidIcon.style.display = 'inline';
    //     }
    // }

    // document.getElementById('email').addEventListener('input', function () {
    //     toggleValidation(this, validateEmail(this.value));
    // });

    // document.getElementById('password').addEventListener('input', function () {
    //     toggleValidation(this, validatePassword(this.value));
    // });

    // document.getElementById('cpf').addEventListener('input', function () {
    //     toggleValidation(this, validateCPF(this.value));
    // });

    // document.getElementById('cnpj').addEventListener('input', function () {
    //     toggleValidation(this, validateCNPJ(this.value));
    // });
});


