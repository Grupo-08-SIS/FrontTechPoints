document.addEventListener('DOMContentLoaded', () => {
    const notificationsIcon = document.querySelector('.notifications');
    const notificationsDropdown = document.querySelector('.notifications-dropdown');
    const userProfile = document.querySelector('.user-profile');
    const userDetails = document.querySelector('.user-details');

    notificationsIcon.addEventListener('click', () => {
        notificationsDropdown.style.display = notificationsDropdown.style.display === 'block' ? 'none' : 'block';
        userDetails.style.display = 'none';  // Close user details if open
    });

    userProfile.addEventListener('click', () => {
        userDetails.style.display = userDetails.style.display === 'block' ? 'none' : 'block';
        notificationsDropdown.style.display = 'none';  // Close notifications if open
    });

    document.addEventListener('click', (event) => {
        if (!notificationsIcon.contains(event.target) && !userProfile.contains(event.target)) {
            notificationsDropdown.style.display = 'none';
            userDetails.style.display = 'none';
        }
    });

    // const courseSelect = document.getElementById('course-select');

    // const statsData = {
    //     excel: {
    //         atividadesEntregues: '45%',
    //         atividadesEntreguesChange: '⬆',
    //         pontosSemana: '150 pts',
    //         pontosSemanaChange: '⬆',
    //         semanaPassadaChange: '+ ⬆ 1K pts'
    //     },
    //     confeitaria: {
    //         atividadesEntregues: '30%',
    //         atividadesEntreguesChange: '⬇',
    //         pontosSemana: '0 pts',
    //         pontosSemanaChange: '⬇',
    //         semanaPassadaChange: '+ ⬆ 2K pts'
    //     },
    //     design: {
    //         atividadesEntregues: '50%',
    //         atividadesEntreguesChange: '⬆',
    //         pontosSemana: '200 pts',
    //         pontosSemanaChange: '⬆',
    //         semanaPassadaChange: '+ ⬆ 3K pts'
    //     }

    
    // };

   

    // courseSelect.addEventListener('change', (event) => {
    //     const selectedCourse = event.target.value;
    //     const data = statsData[selectedCourse];

    //     document.getElementById('atividades-entregues').textContent = data.atividadesEntregues;
    //     document.getElementById('atividades-entregues-change').textContent = data.atividadesEntreguesChange;
    //     document.getElementById('pontos-semana').textContent = data.pontosSemana;
    //     document.getElementById('pontos-semana-change').textContent = data.pontosSemanaChange;
    //     document.getElementById('semana-passada-change').textContent = data.semanaPassadaChange;

    //     // Atualizar a imagem da medalha de acordo com o curso selecionado
    //     const medalhaCurso = document.getElementById('medalha-curso');
    //     if (selectedCourse === 'excel') {
    //         medalhaCurso.src = 'img/silver medal.png';
    //     } else if (selectedCourse === 'confeitaria') {
    //         medalhaCurso.src = 'img/Group 46.png';
    //     } else if (selectedCourse === 'design') {
    //         medalhaCurso.src = 'img/bronze medal.png';
    //     }
    //     const atividadesEntreguesChange = document.getElementById('atividades-entregues-change');
    //     const pontosSemanaChange = document.getElementById('pontos-semana-change');
    //     const semanaPassadaChange = document.getElementById('semana-passada-change');

    //      // Função para definir a cor do texto com base no símbolo de seta
    //      const setColor = (element, symbol) => {
    //         if (symbol === '⬆' || symbol === '+') {
    //             element.classList.remove('red');
    //             element.classList.add('green');
    //         } else if (symbol === '⬇' || symbol === '-') {
    //             element.classList.remove('green');
    //             element.classList.add('red');
    //         }
    //     };

    //     setColor(atividadesEntreguesChange, data.atividadesEntreguesChange);
    //     setColor(pontosSemanaChange, data.pontosSemanaChange);
    //     setColor(semanaPassadaChange, data.semanaPassadaChange);


    // });

    $j(document).ready(function() {
        const editProfileButton = document.querySelector('.user-details .btn-primary');
        const editProfileModal = document.getElementById('editProfileModal');
    
        editProfileButton.addEventListener('click', () => {
            const user = JSON.parse(sessionStorage.getItem('user'));
            if (user) {
                document.getElementById('editPrimeiroNomeUsuario').value = user.primeiroNomeUsuario || '';
                document.getElementById('editSobrenomeUsuario').value = user.sobrenomeUsuario || '';
                document.getElementById('editNomeUsuario').value = user.nomeUsuario || '';
                document.getElementById('editEmailUsuario').value = user.email || '';
                document.getElementById('profilePicture').src = user.profilePicture || '../imgs/user photo.png';
            }
            $j(editProfileModal).modal('show');
        });
    
        document.getElementById('editProfileForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const updatedUser = {
                primeiroNomeUsuario: document.getElementById('editPrimeiroNomeUsuario').value,
                sobrenomeUsuario: document.getElementById('editSobrenomeUsuario').value,
                nomeUsuario: document.getElementById('editNomeUsuario').value,
                email: document.getElementById('editEmailUsuario').value,
                profilePicture: document.getElementById('profilePicture').src
            };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            $j(editProfileModal).modal('hide');
            document.querySelectorAll('#nomeUsuario').forEach(el => el.textContent = updatedUser.nomeUsuario);
        });
    
        document.getElementById('deleteProfileButton').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir seu perfil?')) {
                sessionStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        });
    
        document.getElementById('profilePictureInput').addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profilePicture').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
    

    
});

function toggleDay(element) {
    element.classList.toggle('active');
}