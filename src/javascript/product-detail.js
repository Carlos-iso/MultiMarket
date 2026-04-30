const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

console.log('ID do produto:', productId);

async function fetchProduct() {
    const response = await fetch(`https://api.escuelajs.co/api/v1/products/${productId}`);
    const product = await response.json();

    console.log('Produto:', product);

    document.querySelector('.product-title').textContent = product.title;
    document.querySelector('.product-price').textContent = `R$ ${toCoin(product.price)}`;
    document.querySelector('.product-description').textContent = product.description;

    const imgElement = document.createElement('img');
    imgElement.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400x300?text=Sem+Imagem';
    imgElement.alt = product.title;
    document.querySelector('.product-images').appendChild(imgElement);

    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.classList.add('thumbnail-container');

    if (product.images && product.images.length > 0) {
        product.images.forEach(function (imgUrl) {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.classList.add('thumbnail');
            thumbnailContainer.appendChild(thumb);
        });
    }

    document.querySelector('.product-images').appendChild(thumbnailContainer);
}

fetchProduct();

async function fetchRelatedProducts() {
    const response = await fetch(`https://api.escuelajs.co/api/v1/products?limit=8`);
    const products = await response.json();

    const grid = document.getElementById('related-grid');

    products.slice(0, 8).forEach(function (product) {
        const card = document.createElement('div');
        card.classList.add('related-card');

        const img = document.createElement('img');
        img.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/200x120?text=Sem+Imagem';
        img.alt = product.title;

        const name = document.createElement('p');
        name.textContent = product.title;

        const price = document.createElement('p');
        price.textContent = `R$ ${toCoin(product.price)}`;
        price.style.fontSize = '12px';
        price.style.color = '#333';
        price.style.padding = '0 8px 8px';

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(price);
        grid.appendChild(card);
    });
}

fetchRelatedProducts();