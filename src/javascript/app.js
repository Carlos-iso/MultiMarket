async function initApp() {
	const token = localStorage.getItem("access_token");

	if (!token) {
		window.location.href = "/pages/login.html";
		return;
	}

	setTitle("MultiMarket - Sua loja online");
	await loadHeader("header");
	await loadApp("catalog");
	await loadFooter("footer");

	initCatalog(); // MUITO IMPORTANTE
}

function goHome() {
	document.querySelector("#footer").style.display = ""; // ← mostra o footer
	openCatalog();
	window.location.href = "/";
}

function setTitle(title) {
	const titleElement = document.title ? document.querySelector("title") : null;
	if (!titleElement) return;
	titleElement.textContent = title;
}

initApp();
