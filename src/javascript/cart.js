function calcularTotal() {
  const totalDiv = document.querySelector(".total_carrinho");
  const checkboxes = document.querySelectorAll(".checkbox_item:checked");
  let total = 0;
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  checkboxes.forEach((checkbox) => {
    const id = Number(checkbox.dataset.id);
    const item = carrinho.find((item) => item.id === id);
    if (item) total += item.price;
  });

  if (totalDiv) {
    totalDiv.textContent = `Total: R$ ${total.toFixed(2)}`;
  }
}

function renderCarrinho() {
  const list = document.querySelector("#ul-cart");
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (carrinho.length === 0) {
    list.innerHTML = `
            <div class="carrinho-vazio">
            <img src="../src/assets/icons/cartempty.svg" alt="Carrinho vazio">
                <p>Nenhum produto adicionado ao carrinho.</p>
            </div>
        `;
    return;
  }

  carrinho.forEach((item) => {
    const li = document.createElement("li");
    li.className = "iten-cart";
    li.innerHTML = `
        <div class="item-esquerda">
        <input type="checkbox" class="checkbox_item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="item-info">
            <p>${item.title}</p>
            <p class="item-preco">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="lixeira" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
        `;
    list.appendChild(li);
  });
  calcularTotal();
}

function setupCartEvents() {
  const list = document.querySelector("#ul-cart");

  list.addEventListener("click", function (event) {
    if (event.target.closest(".lixeira")) {
      const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

      const id = event.target.closest(".lixeira").dataset.id;
      const index = carrinho.findIndex((item) => item.id === Number(id));

      if (index !== -1) {
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        renderCarrinho();
      }
    }
  });

  list.addEventListener("change", function (event) {
    if (event.target.classList.contains("checkbox_item")) {
      calcularTotal();
    }
  });
}

async function openCart() {
  setTitle("Carrinho - MultiMarket");
  await loadApp("cart");
  await loadFooter("footer-cart");
  setupCartEvents();
  renderCarrinho();

  const btnFinalizar = document.querySelector(".finalizar_compra");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
      const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

      if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
      }

      const checkboxes = document.querySelectorAll(".checkbox_item:checked");
      if (checkboxes.length === 0) {
        alert("Selecione pelo menos um item para finalizar a compra.");
        return;
      }

      const itensSelecionados = [];
      checkboxes.forEach((checkbox) => {
        const id = Number(checkbox.dataset.id);
        const item = carrinho.find((item) => item.id === id);
        if (item) itensSelecionados.push(item);
      });

      localStorage.setItem(
        "itensSelecionados",
        JSON.stringify(itensSelecionados),
      );
      localStorage.setItem("paymentOrigin", "cart");
      openPayment();
    });
  }
}

async function openProfile() {
  await loadApp("profile");
}
