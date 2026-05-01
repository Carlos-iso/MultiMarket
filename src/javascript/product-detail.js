const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

console.log('Product ID:', productId);

let currentProduct = null;

// FETCH PRODUCT
async function fetchProduct() {
    try {
        const response = await fetch(`https://api.escuelajs.co/api/v1/products/${productId}`);

        if (!response.ok) throw new Error(`Erro ao buscar produto: ${response.status}`);

        const product = await response.json();
        currentProduct = product;

        document.querySelector('.product-title').textContent = product.title;
        document.querySelector('.product-price').textContent = `R$ ${toCoin(product.price)}`;
        document.querySelector('.product-description').textContent = product.description;

        const imagesContainer = document.querySelector('.product-images');
        imagesContainer.innerHTML = '';

        const imgElement = document.createElement('img');
        imgElement.src = product.images?.[0] || 'https://placehold.co/400x300?text=No+Image';
        imgElement.alt = product.title;
        imgElement.onerror = () => {
            imgElement.src = 'https://placehold.co/400x300?text=No+Image';
        };
        imagesContainer.appendChild(imgElement);

        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.classList.add('thumbnail-container');

        product.images?.forEach(imgUrl => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.classList.add('thumbnail');
            thumb.onerror = () => {
                thumb.src = 'https://placehold.co/60x60?text=No+Image';
            };
            thumb.addEventListener('click', () => {
                imgElement.src = imgUrl;
            });
            thumbnailContainer.appendChild(thumb);
        });

        imagesContainer.appendChild(thumbnailContainer);

    } catch (error) {
        console.error('Erro ao carregar produto:', error);
    }
}

fetchProduct();

// RELATED PRODUCTS
async function fetchRelatedProducts() {
    try {
        const response = await fetch(`https://api.escuelajs.co/api/v1/products?limit=8`);

        if (!response.ok) throw new Error(`Erro ao buscar produtos relacionados: ${response.status}`);

        const products = await response.json();
        const grid = document.getElementById('related-grid');

        products.slice(0, 8).forEach(product => {
            const card = document.createElement('div');
            card.classList.add('related-card');

            const img = document.createElement('img');
            img.src = product.images?.[0] || 'https://placehold.co/200x120?text=No+Image';
            img.alt = product.title;
            img.onerror = () => {
                img.src = 'https://placehold.co/200x120?text=No+Image';
            };

            const name = document.createElement('p');
            name.textContent = product.title;

            const price = document.createElement('p');
            price.textContent = `R$ ${toCoin(product.price)}`;
            price.style.fontSize = '12px';

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(price);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar produtos relacionados:', error);
    }
}

fetchRelatedProducts();

// BUY BUTTON
const buyButton = document.querySelector('.btn-buy');

buyButton.addEventListener('click', () => {
    if (!currentProduct) return;
    localStorage.setItem('product', JSON.stringify(currentProduct));
    window.location.href = './payment.html';
});