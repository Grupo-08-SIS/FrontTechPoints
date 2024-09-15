document.addEventListener("DOMContentLoaded", function () {
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
    const profileImageHeader = document.getElementById('profileImageHeader'); // Imagem do header
    const profileImage = document.getElementById('profileImage'); // Imagem da seção
    const defaultImageUrl = '/imgs/foto_padrao.png'; // Defina o caminho da imagem padrão

    // Verifica se os elementos estão presentes
    if (!uploadButton || !fileInput || !profileImageHeader || !profileImage) {
        console.error('Um ou mais elementos não foram encontrados no DOM.');
        return;
    }

    // Função para buscar e aplicar a imagem de perfil
    async function fetchProfileImage() {
        const userId = JSON.parse(sessionStorage.getItem('user')).id;
        try {
            const response = await fetch(`http://localhost:8080/usuarios/imagem/${userId}`);
            if (response.ok) {
                const imageBlob = await response.blob();
                
                // Verifica se o Blob tem conteúdo (não é vazio)
                if (imageBlob.size > 0) {
                    const imageUrl = URL.createObjectURL(imageBlob);
                    profileImageHeader.src = imageUrl; // Aplica no header
                    profileImage.src = imageUrl; // Aplica na seção
                } else {
                    profileImageHeader.src = defaultImageUrl; // Imagem padrão no header
                    profileImage.src = defaultImageUrl; // Imagem padrão na seção
                }
            } else {
                console.error('Falha ao buscar a imagem.');
                profileImageHeader.src = defaultImageUrl; // Imagem padrão em caso de falha
                profileImage.src = defaultImageUrl; // Imagem padrão em caso de falha
            }
        } catch (error) {
            console.error('Erro ao buscar a imagem:', error);
            profileImageHeader.src = defaultImageUrl; // Imagem padrão em caso de erro
            profileImage.src = defaultImageUrl; // Imagem padrão em caso de erro
        }
    }

    // Lógica para o upload da nova imagem de perfil
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

    // Carrega a imagem de perfil ao carregar a página
    fetchProfileImage();
});
