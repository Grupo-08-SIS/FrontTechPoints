document.addEventListener("DOMContentLoaded", async function() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    const span = document.getElementById('span_data_criacao');
    span.innerHTML = user.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString() : 'Data não disponível';

    const span2 = document.getElementById("span_data_ultima_atualizacao")
    span2.innerHTML = user.dataAtualizacao ? new Date(user.dataAtualizacao).toLocaleDateString() : 'Data não disponível';

    async function fetchProfileImage() {
        if (user && user.idUsuario) {
            try {
                const response = await fetch(`http://localhost:8080/usuarios/imagem/${user.idUsuario}`);
                if (response.ok) {
                    const imageData = await response.blob();
                    const imageUrl = URL.createObjectURL(imageData);
                    document.querySelector('.perfil-imagem-editar').src = imageUrl;
                    document.querySelector
                } else {
                    document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
                }
            } catch (error) {
                console.error('Erro ao buscar imagem do perfil:', error);
                document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
            }
        } else {
            document.querySelector('.perfil-imagem-editar').src = '../imgs/perfil_vazio.jpg';
        }
    }

    // Carrega a imagem de perfil inicial
    await fetchProfileImage();

    // Seletores
    const uploadButton = document.querySelector('.upload_button');
    const fileInput = document.getElementById('upload');
    const profileImage = document.querySelector('.perfil-imagem-editar');

    if (uploadButton && fileInput && profileImage) {
        // Evento de mudança no input de arquivo
        fileInput.addEventListener('change', function() {
            const file = fileInput.files[0];

            if (file) {
                console.log('Imagem selecionada:', file.name);

                // Cria uma URL de objeto para mostrar a imagem selecionada
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                console.error('Nenhum arquivo selecionado.');
            }
        });

        // Evento de clique no botão de upload
        uploadButton.addEventListener('click', async function() {
            const file = fileInput.files[0];

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const byteArray = new Uint8Array(arrayBuffer);

                    const response = await fetch(`http://localhost:8080/atualizar-imagem/${user.idUsuario}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': file.type
                        },
                        body: byteArray
                    });

                    if (response.ok) {
                        console.log('Imagem enviada com sucesso!');
                        await fetchProfileImage(); // Recarrega a imagem de perfil após o upload
                    } else {
                        console.error('Falha ao enviar a imagem.');
                    }
                } catch (error) {
                    console.error('Erro ao enviar a imagem:', error);
                }
            } else {
                console.error('Nenhum arquivo selecionado.');
            }
        });
    } else {
        console.error('Botão de upload, input de arquivo ou imagem de perfil não encontrado.');
    }
});
