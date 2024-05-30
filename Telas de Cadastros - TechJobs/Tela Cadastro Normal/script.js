document.addEventListener('DOMContentLoaded', function () {
    const profileTab = document.getElementById('profile-tab');
    const personalTab = document.getElementById('personal-tab');
    const tabs = [profileTab, personalTab];
    const profileData = document.getElementById('profile-data');
    const personalData = document.getElementById('personal-data');
    const continueBtn = document.getElementById('continue-btn');
    const backBtn = document.getElementById('back-btn');
    const profileCheck = document.getElementById('profile-check');
    const termsLink = document.getElementById('terms-link');
    const registerForm = document.getElementById('register-form');

    const termsModal = document.getElementById('terms-modal');
    const closeModal = document.querySelector('.modal .close');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (tab.id === 'personal-tab' && profileCheck.style.display !== 'inline') {
                alert('Preencha os dados do perfil antes de continuar.');
                return;
            }
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            profileData.style.display = tab.id === 'profile-tab' ? 'block' : 'none';
            personalData.style.display = tab.id === 'personal-tab' ? 'block' : 'none';
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
            profileCheck.style.display = 'inline';
        } else {
            alert('Preencha todos os campos do perfil.');
        }
    });

    backBtn.addEventListener('click', function () {
        personalTab.classList.remove('active');
        profileTab.classList.add('active');
        personalData.style.display = 'none';
        profileData.style.display = 'block';
    });

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;

    function showSlide(index) {
        carouselItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    prevBtn.addEventListener('click', function () {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - 1;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', function () {
        currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
        showSlide(currentIndex);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            showSlide(index);
            currentIndex = index;
        });
    });

    showSlide(currentIndex);

    registerForm.addEventListener('submit', function (e) {
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            e.preventDefault();
            alert('Você deve concordar com os termos de uso antes de enviar o formulário.');
        }
    });

    termsLink.addEventListener('click', function () {
        termsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function () {
        termsModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === termsModal) {
            termsModal.style.display = 'none';
        }
    });

    const isHRCheckbox = document.getElementById('is-hr');

    isHRCheckbox.addEventListener('change', function () {
        if (this.checked) {
            // Redirecionar para a tela de cadastro do RH
            window.location = '\Tela Cadastro RH\index2.html';
        }
    });



    const infoIcon = document.getElementById('info-icon');
    const infoModal = document.getElementById('info-modal');
    const closeInfoModal = document.querySelector('#info-modal .close');

    infoIcon.addEventListener('click', function () {
        infoModal.style.display = 'block';
    });

    closeInfoModal.addEventListener('click', function () {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
});

