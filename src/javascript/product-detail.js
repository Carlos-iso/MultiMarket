const params = new URLSearchParams(window.location.search);

const productId = params.get('id');

console.log('ID dom produto:', productId);

async function fetchProduct(params) {
    // Função que busca o produto na API
    const response = await fetch(`https://api.escuelajs.co/api/v1/products/${productId}`);
    const product = await response.json();

    console.log('Produto:', product)

    document.querySelector('.product-title').textContent = product.title;
    document.querySelector('.product-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
    document.querySelector('.product-description').textContent = product.description

    const imgElement = document.createElement('img');
    imgElement.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400x300?text=Sem+Imagem';
    imgElement.alt = product.title;
    document.querySelector('.product-images').appendChild(imgElement);

}

// Chama a função
fetchProduct();

async function fetchRelatedProducts() {
    const response = await fetch(`https://api.escuelajs.co/api/v1/products?limit=4`);
    const products = await response.json();

    const grid = document.getElementById('related-grid');

    products.slice(0, 4).forEach(function (product) {
        const card = document.createElement('div');
        card.classList.add('related-card');

        const img = document.createElement('img');
        img.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/200x120?text=Sem+Imagem';
        img.alt = product.title;

        const name = document.createElement('p');
        name.textContent = product.title;

        card.appendChild(img);
        card.appendChild(name);
        grid.appendChild(card);
    });
}

fetchRelatedProducts();