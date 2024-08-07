document.addEventListener("DOMContentLoaded", function() {
    const data = JSON.parse(sessionStorage.getItem('user'))
    
    console.log(data)

    h1 = document.getElementById("id_nome_usuario").innerHTML = `${data.primeiroNome}  ${data.sobrenome}`
})
