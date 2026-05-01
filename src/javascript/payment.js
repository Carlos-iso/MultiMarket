function toCoin(value) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const options = document.querySelectorAll('.option');

const button = document.querySelector('.pay-button');

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

  localStorage.removeItem('product');

  alert('Pagamento realizado com sucesso!');

  window.location.href = '../index.html';
});

const product = JSON.parse(localStorage.getItem('product'));

if (product) {
  document.querySelector('.product-title').innerText = product.title;
  document.querySelector('.product-price').innerText = `R$ ${toCoin(product.price)}`;
  document.querySelector('.footer span').innerText = `TOTAL: R$ ${toCoin(product.price)}`;
}