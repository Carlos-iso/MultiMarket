function initCount() {
	const cartCount = document.getElementById("cart-count");
	cartCount.value = "0";
    const cartItems = JSON.parse(localStorage.getItem("carrinho")) || [];
	if (cartItems.length > 0) {
		cartCount.value = cartItems.length;
	}
}
