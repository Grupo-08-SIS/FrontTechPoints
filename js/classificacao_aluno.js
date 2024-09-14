document.addEventListener('DOMContentLoaded', async function () {
    const notificationsIcon = document.querySelector('.notifications');
    const notificationsDropdown = document.querySelector('.notifications-dropdown');
    const userProfile = document.querySelector('.user-profile');
    const userDetails = document.querySelector('.user-details');
    const menuIcon = document.querySelector('.menu');
    const menuDropdown = document.querySelector('.menu-dropdown');

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

    const toggleDropdown = (dropdown) => {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };

    menuIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown(menuDropdown);
        notificationsDropdown.style.display = 'none';  // Close notifications if open
        userDetails.style.display = 'none';  // Close user details if open
    });

    document.addEventListener('click', (event) => {
        if (!notificationsIcon.contains(event.target) && !notificationsDropdown.contains(event.target) &&
            !userProfile.contains(event.target) && !userDetails.contains(event.target) &&
            !menuIcon.contains(event.target) && !menuDropdown.contains(event.target)) {
            notificationsDropdown.style.display = 'none';
            userDetails.style.display = 'none';
            menuDropdown.style.display = 'none';
        }
    });

    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.idUsuario) {
        try {
            const response = await fetch(`http://localhost:8080/usuarios/imagem/${user.idUsuario}`);
            if (response.ok) {
                const imageData = await response.blob();
                const imageUrl = URL.createObjectURL(imageData);

                document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
                    imgElement.src = imageUrl;
                });
            } else {
                document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
                    imgElement.src = '../imgs/perfil_vazio.jpg';
                });
            }
        } catch (error) {
            console.error('Erro ao buscar imagem do perfil:', error);
            document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
                imgElement.src = '../imgs/perfil_vazio.jpg';
            });
        }
    } else {
        document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
            imgElement.src = '../imgs/perfil_vazio.jpg';
        });
    }

    try {
        const response = await fetch(`http://localhost:8080/usuarios/buscar/${user.idUsuario}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }
        const userData = await response.json();

        document.getElementById('editPrimeiroNomeUsuario').value = userData.primeiroNome;
        document.getElementById('editSobrenomeUsuario').value = userData.sobrenome;
        document.getElementById('editNomeUsuario').value = userData.nomeUsuario;
        document.getElementById('editEmailUsuario').value = userData.email;
    } catch (error) {
        console.error('Erro ao preencher os campos dos inputs:', error);
    }

    document.getElementById('editProfileForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita o comportamento padrão de submissão do formulário

        const fileInput = document.getElementById('perfil-imagem-input');
        const file = fileInput.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('imagem', file);

            try {
                const response = await fetch(`http://localhost:8080/usuarios/atualizar-imagem/${user.idUsuario}`, {
                    method: 'PATCH',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Erro ao atualizar a imagem do perfil');
                }

                console.log('Imagem do perfil atualizada com sucesso');
                window.location.reload();
            } catch (error) {
                console.error('Erro ao atualizar a imagem do perfil:', error);
            }
        } else {
            console.error('Nenhuma nova imagem selecionada');
        }
    });

    document.getElementById('editProfileForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita o comportamento padrão de submissão do formulário

        const primeiroNome = document.getElementById('editPrimeiroNomeUsuario').value;
        const sobrenome = document.getElementById('editSobrenomeUsuario').value;
        const nomeUsuario = document.getElementById('editNomeUsuario').value;
        const email = document.getElementById('editEmailUsuario').value;

        try {
            const response = await fetch(`http://localhost:8080/usuarios/atualizar/${user.idUsuario}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    primeiroNome: primeiroNome,
                    sobrenome: sobrenome,
                    nomeUsuario: nomeUsuario,
                    email: email
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar o perfil do usuário');
            }

            console.log('Perfil do usuário atualizado com sucesso');

            user.nomeUsuario = nomeUsuario;
            sessionStorage.setItem('user', JSON.stringify(user));

            window.alert('Informações atualizadas com sucesso');

            window.location.reload();

        } catch (error) {
            window.alert('Erro ao atualizar o perfil do usuário:', error);
        }
    });

    document.getElementById('confirmDeleteButton').addEventListener('click', async function () {
        var email = document.getElementById('confirmEmail').value;
        var senha = document.getElementById('confirmPassword').value;

        if (!email || !senha) {
            alert('Por favor, preencha o email e a senha para confirmar a exclusão.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/usuarios/deletar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir o perfil do usuário');
            }

            console.log('Perfil do usuário excluído com sucesso');

            window.location.href = '/html/home.html';

        } catch (error) {
            console.error('Erro ao excluir o perfil do usuário:', error);
            alert('Erro ao excluir o perfil do usuário. Por favor, tente novamente.');
        }
    });

    async function fazerLogout() {
        const user = JSON.parse(sessionStorage.getItem('user'));

        try {
            const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.id}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Erro ao fazer logoff');
            }

            sessionStorage.clear();

            window.location.href = '/html/home.html';

        } catch (error) {
            console.error('Erro ao fazer logoff:', error);
            alert('Erro ao fazer logoff. Por favor, tente novamente.');
        }
    }

    $(document).ready(async function () {
        // Função para buscar dados de classificação
        async function fetchRankingData(cursoId = null) {
            try {
                const response = await fetch(`http://localhost:8080/classificacao${cursoId ? `?cursoId=${cursoId}` : ''}`);
                if (!response.ok) {
                    throw new Error('Erro ao buscar dados de classificação');
                }
                return await response.json();
            } catch (error) {
                console.error(error);
                return [];
            }
        }

        function renderRankingTable(students) {
            $('#rankingTable').empty();
            students.sort((a, b) => b.totalPontos - a.totalPontos);
            students.forEach((student, index) => {
                let medal;
                if (index === 0) {
                    medal = '<img src="../imgs/gold medal.png" class="medal gold-medal">';
                } else if (index === 1) {
                    medal = '<img src="../imgs/silver medal.png" class="medal silver-medal">';
                } else if (index === 2) {
                    medal = '<img src="../imgs/bronze medal.png" class="medal bronze-medal">';
                } else {
                    medal = index + 1;
                }
                $('#rankingTable').append(`
                    <tr>
                        <td>${medal}</td>
                        <td>
                            <div class="user-details">
                                <img src="${student.photo || '../imgs/perfil_vazio.jpg'}" alt="${student.nomeUsuario}">
                                <div class="user-info">
                                    <span class="username">${student.nomeUsuario}</span>
                                    <span class="email">${student.email}</span>
                                </div>
                            </div>
                        </td>
                        <td>${student.totalPontos}</td>
                        <td>${student.categoria}</td>
                    </tr>
                `);
            });
        }

        $('#courseFilter').on('change', async function () {
            const filter = $(this).val();
            const students = await fetchRankingData(filter);
            renderRankingTable(students);
        });

        const students = await fetchRankingData();
        renderRankingTable(students);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const data = JSON.parse(sessionStorage.getItem('user'));

    if (data && data.idUsuario) {
        const userId = data.idUsuario;

        // Fetch para buscar os cursos disponíveis para o usuário
        fetch(`http://localhost:8080/grafico/pontos-por-curso?idUsuario=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar dados: ${response.status}`);
                }
                return response.json();
            })
            .then(pontos => {
                const selectElement = document.getElementById("courseFilter");

                // Limpa as opções existentes
                selectElement.innerHTML = '<option value="all">Cursos</option>';

                // Adiciona novas opções baseadas nos dados retornados
                pontos.forEach(ponto => {
                    const option = document.createElement("option");
                    option.value = ponto.idCurso; // Valor do curso como ID
                    option.textContent = ponto.nomeCurso; // Nome do curso
                    selectElement.appendChild(option);
                });

                // Adiciona um listener para quando o usuário selecionar um curso
                selectElement.addEventListener('change', function () {
                    const selectedCourseId = selectElement.value;
                    if (selectedCourseId !== "all") {
                        fetchClassificacao(selectedCourseId);
                    } else {
                        // Limpa a tabela se "all" for selecionado
                        document.getElementById("rankingTable").innerHTML = '';
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao carregar os cursos:', error);
            });
    } else {
        console.error('ID do usuário não encontrado.');
    }

    // Função para buscar a classificação dos alunos e preencher a tabela
    function fetchClassificacao(courseId) {
        fetch(`http://localhost:8080/grafico/classificacao?cursoId=${courseId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar classificação: ${response.status}`);
                }
                return response.json();
            })
            .then(alunos => {
                const rankingTable = document.getElementById("rankingTable");

                
                rankingTable.innerHTML = '';

               
                alunos.forEach((aluno, index) => {
                    const row = document.createElement("tr");

                    const positionCell = document.createElement("td");
                    positionCell.textContent = index + 1; 
                    row.appendChild(positionCell);

                    const userCell = document.createElement("td");

                    const userContainer = document.createElement("div");
                    userContainer.style.display = 'flex'; 
                    userContainer.style.alignItems = 'center'; 
                    userContainer.style.justifyContent = 'center'; 

                    
                    const userImage = document.createElement("img");
                    userImage.src = '../imgs/perfil_vazio.jpg'; 
                    userImage.alt = 'Imagem do usuário'; 
                    userImage.style.width = '40px'; 
                    userImage.style.height = '40px'; 
                    userImage.style.marginRight = '10px'; 
                    userImage.style.borderRadius = '50%'; 

                    
                    const textContainer = document.createElement("div");

                    
                    const nomeDiv = document.createElement("div");
                    nomeDiv.textContent = aluno.nomeUsuario;
                    nomeDiv.style.fontWeight = 'bold'; 

                    
                    const emailDiv = document.createElement("div");
                    emailDiv.textContent = aluno.email;
                    emailDiv.style.fontSize = 'smaller'; 

                    
                    textContainer.appendChild(nomeDiv);
                    textContainer.appendChild(emailDiv);

                    
                    userContainer.appendChild(userImage);
                    userContainer.appendChild(textContainer);

                    userCell.appendChild(userContainer);

                    row.appendChild(userCell);

                    const pointsCell = document.createElement("td");
                    pointsCell.textContent = aluno.totalPontos; 
                    row.appendChild(pointsCell);

                    rankingTable.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar a classificação:', error);
            });
    }
});







// Funções de notificação
// function getNotificationMessage(notificationType) {
//     switch (notificationType) {
//         case 'match':
//             return 'Você completou uma nova correspondência!';
//         case 'message':
//             return 'Você recebeu uma nova mensagem!';
//         case 'reminder':
//             return 'Lembre-se de verificar sua conta!';
//         default:
//             return 'Você tem uma nova notificação!';
//     }
// }

// function showNotification(notificationType) {
//     const message = getNotificationMessage(notificationType);
//     $('#notificationDropdown').append(`
//         <div class="notification-item">
//             <p>${message}</p>
//             <button class="btn btn-sm btn-primary">Ver</button>
//         </div>
//     `);
// }

// Mock de recebimento de notificações
// setInterval(() => {
//     const types = ['match', 'message', 'reminder'];
//     const randomType = types[Math.floor(Math.random() * types.length)];
//     showNotification(randomType);
// }, 5000);


// POSSIVEL TESTE PARA SER DINAMICO:

// document.addEventListener('DOMContentLoaded', async function() {
//     const notificationsIcon = document.querySelector('.notifications')
//     const notificationsDropdown = document.querySelector('.notifications-dropdown')
//     const userProfile = document.querySelector('.user-profile')
//     const userDetails = document.querySelector('.user-details')
//     const menuIcon = document.querySelector('.menu')
//     const menuDropdown = document.querySelector('.menu-dropdown')

//     notificationsIcon.addEventListener('click', () => {
//         notificationsDropdown.style.display = notificationsDropdown.style.display === 'block' ? 'none' : 'block'
//         userDetails.style.display = 'none'  // Close user details if open
//     })

//     userProfile.addEventListener('click', () => {
//         userDetails.style.display = userDetails.style.display === 'block' ? 'none' : 'block'
//         notificationsDropdown.style.display = 'none'  // Close notifications if open
//     })

//     document.addEventListener('click', (event) => {
//         if (!notificationsIcon.contains(event.target) && !userProfile.contains(event.target)) {
//             notificationsDropdown.style.display = 'none'
//             userDetails.style.display = 'none'
//         }
//     })

//     const toggleDropdown = (dropdown) => {
//         if (dropdown.style.display === 'block') {
//             dropdown.style.display = 'none'
//         } else {
//             dropdown.style.display = 'block'
//         }
//     }

//     menuIcon.addEventListener('click', (event) => {
//         event.stopPropagation()
//         toggleDropdown(menuDropdown)
//         notificationsDropdown.style.display = 'none'  // Close notifications if open
//         userDetails.style.display = 'none'  // Close user details if open
//     })

//     document.addEventListener('click', (event) => {
//         if (!notificationsIcon.contains(event.target) && !notificationsDropdown.contains(event.target) &&
//             !userProfile.contains(event.target) && !userDetails.contains(event.target) &&
//             !menuIcon.contains(event.target) && !menuDropdown.contains(event.target)) {
//             notificationsDropdown.style.display = 'none'
//             userDetails.style.display = 'none'
//             menuDropdown.style.display = 'none'
//         }
//     })

//     const user = JSON.parse(sessionStorage.getItem('user'))
//     if (user && user.idUsuario) {
//         try {
//             const response = await fetch(`http://localhost:8080/usuarios/imagem/${user.idUsuario}`)
//             if (response.ok) {
//                 const imageData = await response.blob()
//                 const imageUrl = URL.createObjectURL(imageData)

//                 document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
//                     imgElement.src = imageUrl
//                 })
//             } else {
//                 document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
//                     imgElement.src = '../imgs/perfil_vazio.jpg'
//                 })
//             }
//         } catch (error) {
//             console.error('Erro ao buscar imagem do perfil:', error)
//             document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
//                 imgElement.src = '../imgs/perfil_vazio.jpg'
//             })
//         }
//     } else {
//         document.querySelectorAll('.perfil-imagem').forEach(imgElement => {
//             imgElement.src = '../imgs/perfil_vazio.jpg'
//         })
//     }

//     try {
//         const response = await fetch(`http://localhost:8080/usuarios/buscar/${user.idUsuario}`)
//         if (!response.ok) {
//             throw new Error('Erro ao buscar os dados do usuário')
//         }
//         const userData = await response.json()

//         document.getElementById('editPrimeiroNomeUsuario').value = userData.primeiroNome
//         document.getElementById('editSobrenomeUsuario').value = userData.sobrenome
//         document.getElementById('editNomeUsuario').value = userData.nomeUsuario
//         document.getElementById('editEmailUsuario').value = userData.email
//     } catch (error) {
//         console.error('Erro ao preencher os campos dos inputs:', error)
//     }

//     try {
//         const response = await fetch('http://localhost:8080/alunos/ranking')
//         if (!response.ok) {
//             throw new Error('Erro ao buscar os dados do ranking')
//         }
//         const students = await response.json()

//         function renderRankingTable(filter = 'all') {
//             $('#rankingTable').empty()
//             let filteredStudents = students
//             if (filter !== 'all') {
//                 filteredStudents = students.filter(student => student.course === filter)
//             }
//             filteredStudents.sort((a, b) => b.points - a.points)
//             filteredStudents.forEach((student, index) => {
//                 let medal
//                 if (index === 0) {
//                     medal = '<img src="../imgs/gold medal.png" class="medal gold-medal">'
//                 } else if (index === 1) {
//                     medal = '<img src="../imgs/silver medal.png" class="medal silver-medal">'
//                 } else if (index === 2) {
//                     medal = '<img src="../imgs/bronze medal.png" class="medal bronze-medal">'
//                 } else {
//                     medal = index + 1
//                 }
//                 $('#rankingTable').append(`
//                     <tr>
//                         <td>${medal}</td>
//                         <td>
//                             <div class="user-details">
//                                 <img src="${student.photo}" alt="${student.username}">
//                                 <div class="user-info">
//                                     <span class="username">${student.username}</span>
//                                     <span class="email">${student.email}</span>
//                                 </div>
//                             </div>
//                         </td>
//                         <td>${student.points}</td>
//                     </tr>
//                 `)
//             })
//         }

//         $('#courseFilter').on('change', function () {
//             const filter = $(this).val()
//             renderRankingTable(filter)
//         })

//         renderRankingTable()
//     } catch (error) {
//         console.error('Erro ao buscar e renderizar os dados do ranking:', error)
//     }
// })

// document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
//     event.preventDefault() // Evita o comportamento padrão de submissão do formulário

//     const user = JSON.parse(sessionStorage.getItem('user'))

//     const fileInput = document.getElementById('perfil-imagem-input')
//     const file = fileInput.files[0]

//     if (file) {
//         const formData = new FormData()
//         formData.append('imagem', file)

//         try {
//             const response = await fetch(`http://localhost:8080/usuarios/atualizar-imagem/${user.idUsuario}`, {
//                 method: 'PATCH',
//                 body: file,
//                 headers: {
//                     'Content-Type': 'image/jpeg'
//                 },
//             })

//             if (!response.ok) {
//                 throw new Error('Erro ao atualizar a imagem do perfil')
//             }

//             console.log('Imagem do perfil atualizada com sucesso')
//             window.location.reload()
//         } catch (error) {
//             console.error('Erro ao atualizar a imagem do perfil:', error)
//         }
//     } else {
//         console.error('Nenhuma nova imagem selecionada')
//     }
// })

// document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
//     event.preventDefault() // Evita o comportamento padrão de submissão do formulário

//     const user = JSON.parse(sessionStorage.getItem('user'))

//     const primeiroNome = document.getElementById('editPrimeiroNomeUsuario').value
//     const sobrenome = document.getElementById('editSobrenomeUsuario').value
//     const nomeUsuario = document.getElementById('editNomeUsuario').value
//     const email = document.getElementById('editEmailUsuario').value

//     try {
//         const response = await fetch(`http://localhost:8080/usuarios/atualizar/${user.idUsuario}`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 primeiroNome: primeiroNome,
//                 sobrenome: sobrenome,
//                 nomeUsuario: nomeUsuario,
//                 email: email
//             })
//         })

//         if (!response.ok) {
//             throw new Error('Erro ao atualizar o perfil do usuário')
//         }

//         console.log('Perfil do usuário atualizado com sucesso')

//         user.nomeUsuario = nomeUsuario
//         sessionStorage.setItem('user', JSON.stringify(user))

//         window.alert('Informações atualizadas com sucesso')

//         window.location.reload()
//     } catch (error) {
//         window.alert('Erro ao atualizar o perfil do usuário:', error)
//     }
// })

// document.getElementById('confirmDeleteButton').addEventListener('click', async function() {
//     var email = document.getElementById('confirmEmail').value
//     var senha = document.getElementById('confirmPassword').value

//     if (!email || !senha) {
//         alert('Por favor, preencha o email e a senha para confirmar a exclusão.')
//         return
//     }
//     try {
//         const response = await fetch('http://localhost:8080/usuarios/deletar', {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 email: email,
//                 senha: senha
//             })
//         })

//         if (!response.ok) {
//             throw new Error('Erro ao excluir o perfil do usuário')
//         }

//         console.log('Perfil do usuário excluído com sucesso')

//         window.location.href = '/html/home.html'
//     } catch (error) {
//         console.error('Erro ao excluir o perfil do usuário:', error)
//         alert('Erro ao excluir o perfil do usuário. Por favor, tente novamente.')
//     }
// })

// async function fazerLogout() {
//     const user = JSON.parse(sessionStorage.getItem('user'))

//     try {
//         const response = await fetch(`http://localhost:8080/usuarios/logoff?idUsuario=${user.idUsuario}`, {
//             method: 'POST'
//         })

//         if (!response.ok) {
//             throw new Error('Erro ao fazer logoff')
//         }

//         sessionStorage.clear()

//         window.location.href = '/html/home.html'
//     } catch (error) {
//         console.error('Erro ao fazer logoff:', error)
//         alert('Erro ao fazer logoff. Por favor, tente novamente.')
//     }
// }
