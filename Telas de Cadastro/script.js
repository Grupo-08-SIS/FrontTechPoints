document.addEventListener('DOMContentLoaded', function () {
    const profileTab = document.getElementById('shape1');
    const personalTab = document.getElementById('shape2');
    const tabs = [profileTab, personalTab];
    const profileData = document.getElementById('step1');
    const personalData = document.getElementById('step2');
    const continueBtn = document.querySelector('.continue-btn');
    const backBtn = document.querySelector('.back-btn');
    const profileCheck = document.getElementById('check1');
    const termsLink = document.getElementById('terms-link');
    const registerForm = document.querySelector('form');
    const cpfInput = document.getElementById('cpf');
    const helpBtn = document.querySelector('.help-btn');
    const infoModal = document.getElementById('info-modal');
    const closeInfoModal = document.querySelector('#info-modal .close');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (tab.id === 'shape2' && profileCheck.style.display !== 'flex') {
                alert('Preencha os dados do perfil antes de continuar.');
                return;
            }
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            profileData.style.display = tab.id === 'shape1' ? 'block' : 'none';
            personalData.style.display = tab.id === 'shape2' ? 'block' : 'none';
        });
    });


    continueBtn.addEventListener('click', function () {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (username && email && password) {
            profileTab.classList.remove('active');
            personalTab.classList.add('active');
            profileData.style.display = 'none';
            personalData.style.display = 'block';
            profileCheck.style.display = 'flex';
        } else {
            alert('Preencha todos os campos antes de continuar.');
        }
    });

    backBtn.addEventListener('click', function () {
        profileTab.classList.add('active');
        personalTab.classList.remove('active');
        profileData.style.display = 'block';
        personalData.style.display = 'none';
    });

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

    const isRHCheckbox = document.getElementById('is-rh');

    isRHCheckbox.addEventListener('change', function () {
        if (this.checked) {
            // Redirecionar para a tela de cadastro do RH
            window.location = 'indexRH.html';
        }
    });

    let slideIndex = 0;
    const slides = document.querySelectorAll('.image');
    const dots = document.querySelectorAll('.dot');
    const leftArrow = document.querySelector('.arrow-left1');
    const rightArrow = document.querySelector('.arrow-right1');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
            dots[i].classList.toggle('active', i === index);
        });
        slideIndex = index;
    }

    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }

    function previousSlide() {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        showSlide(slideIndex);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    leftArrow.addEventListener('click', previousSlide);
    rightArrow.addEventListener('click', nextSlide);

    showSlide(slideIndex);

    setInterval(nextSlide, 3000); // Change image every 3 seconds
});
