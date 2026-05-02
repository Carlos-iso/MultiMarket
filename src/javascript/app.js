const list = document.querySelector("ul");
const totalDiv = document.querySelector(".total_carrinho");

const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function renderCarrinho() {
  list.innerHTML = "";
  carrinho.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="item-esquerda">
        <input type="checkbox" class="checkbox_item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="item-info">
            <p>${item.title}</p>
            <p class="item-preco">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="lixeira" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        `;
    list.appendChild(li);
  });
  calcularTotal();
}

renderCarrinho();

function calcularTotal() {
  const checkboxes = document.querySelectorAll(".checkbox_item:checked");
  let total = 0;
  checkboxes.forEach((checkbox) => {
    const id = Number(checkbox.dataset.id);
    const item = carrinho.find((item) => item.id === id);
    if (item) {
      total += item.price;
    }
  });
  totalDiv.textContent = `Total: R$ ${total.toFixed(2)}`;
}

list.addEventListener("click", function (event) {
  if (event.target.closest(".lixeira")) {
    const id = event.target.closest(".lixeira").dataset.id;
    const index = carrinho.findIndex((item) => item.id === Number(id));
    if (index !== -1) {
      carrinho.splice(index, 1);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      renderCarrinho();
      calcularTotal();
    }
  }
});

list.addEventListener("change", function (event) {
  if (event.target.classList.contains("checkbox_item")) {
    calcularTotal();
  }
});
