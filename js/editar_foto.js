document.addEventListener("DOMContentLoaded", function () {
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
    const profileImage = document.getElementById('profileImage');

    if (!uploadButton || !fileInput || !profileImage) {
        console.error('Um ou mais elementos não foram encontrados no DOM.');
        return;
    }

    async function fetchProfileImage() {
        const userId = JSON.parse(sessionStorage.getItem('user')).id;
        try {
            const response = await fetch(`http://localhost:8080/usuarios/imagem/${userId}`);
            if (response.ok) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                profileImage.src = imageUrl;
            } else {
                console.error('Falha ao buscar a imagem.');
            }
        } catch (error) {
            console.error('Erro ao buscar a imagem:', error);
        }
    }

    uploadButton.addEventListener('click', async function () {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('imagemPerfil', file); // Nome do campo ajustado para o esperado pelo backend

            try {
                const userId = JSON.parse(sessionStorage.getItem('user')).id;
                const response = await fetch(`http://localhost:8080/usuarios/atualizar-imagem/${userId}`, {
                    method: 'PATCH', // Usando o método PATCH conforme configurado no backend
                    body: formData
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

    fetchProfileImage();
});
