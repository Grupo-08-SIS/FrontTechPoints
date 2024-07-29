function adicionarNovoNumero() {
    document.getElementById('novo_telefone').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        value = value.replace(/^(\d{2})(\d)/, '($1) $2'); // Adiciona parênteses ao redor dos dois primeiros dígitos
        value = value.replace(/(\d{5})(\d)/, '$1-$2'); // Adiciona um hífen após os cinco primeiros dígitos restantes
        e.target.value = value;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    adicionarNovoNumero();
});