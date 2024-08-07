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

function showTooltip(event, text) {
    var tooltip = document.getElementById('tooltip');
    tooltip.textContent = text;
    tooltip.style.opacity = 1;
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = (event.pageY + 20) + 'px';
}

function hideTooltip() {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.opacity = 0;
}
