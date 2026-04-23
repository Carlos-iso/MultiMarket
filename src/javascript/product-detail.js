const params = new URLSearchParams(window.location.search);

const productId = params.get('id');

console.log('ID dom produto:', productId);

async function fetchProduct(params) {
    // Função que busca o produto na API
    const response = await fetch(`https://api.escuelajs.co/api/v1/products/${productId}`);
    const product = await response.json();

    console.log('Produto:', product)

    document.querySelector('.product-title').textContent = product.title;
    document.querySelector('.product-price').textContent = `R$ ${product.price}`;
    document.querySelector('.product-description').textContent = product.description
    
    const imgElement = document.createElement('img');
    imgElement.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400x300?text=Sem+Imagem';
    imgElement.alt = product.title;
    document.querySelector('.product-images').appendChild(imgElement);

}

// Chama a função
fetchProduct();