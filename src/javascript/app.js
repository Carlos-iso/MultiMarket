async function fetchProducts() {
  const response = await fetch(
    "https://api.escuelajs.co/api/v1/products?limit=12",
  );
  const products = await response.json();

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const img = document.createElement("img");
    let imgUrl = product.images?.[0] || "";
    imgUrl = imgUrl
      .replace(/[\[\]"]/g, "")
      .split(",")[0]
      .trim();
    img.src = imgUrl || "https://placehold.co/200x120?text=No+Image";
    img.onerror = () => {
      img.src = "https://placehold.co/200x120?text=No+Image";
    };
    const name = document.createElement("p");
    name.textContent = product.title;

    card.appendChild(img);
    card.appendChild(name);

    card.addEventListener("click", () => {
      window.location.href = `pages/product-detail.html?id=${product.id}`;
    });

    document.getElementById("products-container").appendChild(card);
  });
}

fetchProducts();
