const productId = localStorage.getItem("selectedProductId");

let currentProduct = null;

async function initDetails() {
    const freshId = localStorage.getItem("selectedProductId");
    await fetchProduct(freshId);
    await fetchRelatedProducts();

    const buyButton = document.querySelector('.btn-buy');
    if (buyButton) {
        buyButton.addEventListener('click', () => {
            if (!currentProduct) return;
            localStorage.setItem('paymentOrigin', 'details');
            localStorage.setItem('product', JSON.stringify(currentProduct));
            openPayment();
        });
    }

    const cartButton = document.querySelector('.btn-cart');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            if (!currentProduct) return;

            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            const jaExiste = carrinho.find(item => item.id === currentProduct.id);

            if (jaExiste) {
                alert('Product already in cart!');
                return;
            }

            carrinho.push({
                id: currentProduct.id,
                title: currentProduct.title,
                price: currentProduct.price,
                image: currentProduct.images?.[0] || ''
            });

            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            alert('Product added to cart!');
        });
    }
}

// FETCH PRODUCT
async function fetchProduct(id) {
    try {
        const response = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`);

        if (!response.ok) throw new Error(`Error fetching product: ${response.status}`);

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
        console.error('Error loading product:', error);
    }
}

// RELATED PRODUCTS
async function fetchRelatedProducts() {
    try {
        const response = await fetch(`https://api.escuelajs.co/api/v1/products?limit=8`);

        if (!response.ok) throw new Error(`Error fetching related products: ${response.status}`);

        const products = await response.json();
        const grid = document.getElementById('related-grid');
        grid.innerHTML = '';

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
        console.error('Error loading related products:', error);
    }
}