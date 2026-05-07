const components = {
	"header": "/pages/header.html",
	"cart": "/pages/cart.html",
	"home": "/index.html",
	"catalog": "/pages/catalog.html",
	"profile": "/pages/profile.html",
	"footer": "/pages/footer.html",
	"footer-cart": "/pages/footer-cart.html",
	"details": "/pages/details.html",
	"payment": "/pages/payment.html",
	"footer-payment": "/pages/footer-payment.html",
};

async function loadHeader(page) {
	const path = components[page];
	if (!path) {
		document.querySelector("#header").innerHTML = "<h1>Página não encontrada</h1>";
		return;
	}
	try {
		const response = await fetch(path);
		const html = await response.text();
		document.querySelector("#header").innerHTML = html;
	} catch (error) {
		console.error("Erro ao carregar header:", error);
	}
}

function updatePageStyle(page) {
	const existingLink = document.querySelector("link[data-page-style]");
	if (existingLink) {
		existingLink.remove();
	}

	const pageStyles = {
		profile: "/src/css/profile.css",
	};

	const stylePath = pageStyles[page];
	if (stylePath) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = stylePath;
		link.dataset.pageStyle = page;
		document.head.appendChild(link);
	}
}

async function loadApp(page) {
	const path = components[page];
	if (!path) {
		document.querySelector("#app").innerHTML = "<h1>Página não encontrada</h1>";
		return;
	}
	try {
		updatePageStyle(page);
		const response = await fetch(path);
		const html = await response.text();
		document.querySelector("#app").innerHTML = html;
		
		window.dispatchEvent(new CustomEvent('app:pageLoaded', { detail: { page } }));
	} catch (error) {
		console.error("Erro ao carregar página:", error);
	}
}

async function loadFooter(page) {
	const path = components[page];
	try {
		const response = await fetch(path);
		const html = await response.text();
		document.querySelector("#footer").innerHTML = html;
	} catch (error) {
		console.error("Erro ao carregar footer:", error);
	}
}
