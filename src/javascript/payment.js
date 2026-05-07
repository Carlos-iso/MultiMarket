
async function openPayment() {
    await loadApp('payment');
    await loadFooter('footer');
    await new Promise(resolve => setTimeout(resolve, 50)); // ← pequena pausa
    document.querySelector('#footer').style.display = 'none';
    initPayment();
}

function toCoin(value) {
    return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function initPayment() {
    const options = document.querySelectorAll('.option');
    const button = document.querySelector('.pay-button');
    const product = JSON.parse(localStorage.getItem('product'));
    const itensSelecionados = JSON.parse(localStorage.getItem('itensSelecionados')) || [];
    const container = document.querySelector('#produtos-pagamento');
    const backButton = document.querySelector('.back-btn');

    let total = 0;

    if (backButton) {
        backButton.addEventListener('click', () => {
            const origin = localStorage.getItem('paymentOrigin');
            document.querySelector('#footer').style.display = '';
            if (origin === 'details') {
                openDetails(localStorage.getItem('selectedProductId'));
            } else {
                openCart();
            }
        });
    }

    if (itensSelecionados.length > 0) {
        itensSelecionados.forEach(item => {
            total += item.price;
            container.innerHTML += `
                <div class="product">
                    <img src="${item.image}" alt="${item.title}" class="product-image">
                    <div class="product-details">
                        <p class="product-title">${item.title}</p>
                        <p class="product-price">R$ ${toCoin(item.price)}</p>
                    </div>
                </div>
            `;
        });
    } else if (product) {
        total = product.price;
        container.innerHTML = `
            <div class="product">
                <img src="${product.images?.[0] || ''}" alt="${product.title}">
                <div class="product-details">
                    <p class="product-title">${product.title}</p>
                    <p class="product-price">R$ ${toCoin(product.price)}</p>
                </div>
            </div>
        `;
    }

    document.querySelector('.total-label').innerText = `TOTAL: R$ ${toCoin(total)}`;

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

   button.addEventListener('click', async () => {
    const selected = document.querySelector('.option.selected');
    if (!selected) {
        alert('Selecione um método de pagamento.');
        return;
    }
    button.innerText = 'Processando...';
    button.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    //Remove os itens comprados do carrinho
    const origin = localStorage.getItem('paymentOrigin');
    if (origin === 'cart') {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const comprados = JSON.parse(localStorage.getItem('itensSelecionados')) || [];
        const idsComprados = comprados.map(i => i.id);
        const novoCarrinho = carrinho.filter(item => !idsComprados.includes(item.id));
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
    }

    localStorage.removeItem('product');
    localStorage.removeItem('itensSelecionados');
    localStorage.removeItem('paymentOrigin');
    alert('Pagamento realizado com sucesso!');
    document.querySelector('#footer').style.display = '';
    goHome();
});
}