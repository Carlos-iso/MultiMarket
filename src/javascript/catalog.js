// const API_BASE = "https://fakestoreapi.com";
const API_BASE = "https://api.escuelajs.co/api/v1";
const LIMIT = 20;

const state = {
	currentPage: 1,
	totalProducts: 0,
	filters: {
		title: "",
		categoryId: "",
		price_min: "",
		price_max: "",
	},
};

let productsGrid;
let pagination;
let searchForm;
let searchInput;
let filterCategory;
let filterPriceMin;
let filterPriceMax;
let btnApply;
let btnClear;
let btnFilterMobile;

let openBtn;
let closeBtn;
let filterMenu;
let overlay;

function bindElements() {
	productsGrid = document.getElementById("products-grid");
	pagination = document.getElementById("pagination");
	searchForm = document.getElementById("search-form");
	searchInput = document.getElementById("search-input");
	filterCategory = document.getElementById("filter-category");
	filterPriceMin = document.getElementById("filter-price-min");
	filterPriceMax = document.getElementById("filter-price-max");
	btnApply = document.getElementById("btn-apply-filter");
	btnClear = document.getElementById("btn-clear-filter");
	btnFilterMobile = document.getElementById("btn-filter-mobile");
	openBtn = document.getElementById("openBtn");
	closeBtn = document.getElementById("closeBtn");
	filterMenu = document.getElementById("filterMenu");
	overlay = document.getElementById("overlay");
}

async function openCatalog() {
	await loadApp("catalog");
	initCatalog();
}

function openFilterDrawer() {
	filterMenu.classList.add("active");
	overlay.classList.add("active");
	document.body.style.overflow = "hidden";
}

function closeFilterDrawer() {
	filterMenu.classList.remove("active");
	overlay.classList.remove("active");
	document.body.style.overflow = "";
}

function formatPrice(value) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

function getSafeImage(images) {
	try {
		if (!images || images.length === 0)
			return "https://placehold.co/400x300?text=Sem+Imagem";
		let img = images[0];
		if (img.startsWith("[")) img = JSON.parse(img)[0];
		new URL(img);
		return img;
	} catch {
		return "https://placehold.co/400x300?text=Sem+Imagem";
	}
}

async function loadCategories() {
	try {
		const res = await fetch(`${API_BASE}/categories`);
		const data = await res.json();
		data.forEach((cat) => {
			const opt = document.createElement("option");
			opt.value = cat.id;
			opt.textContent = cat.name;
			filterCategory.appendChild(opt);
		});
	} catch (err) {
		console.error("Erro ao carregar categorias:", err);
	}
}

function buildQueryParams(forCount = false) {
	const offset = forCount ? 0 : (state.currentPage - 1) * LIMIT;
	const limit = forCount ? 200 : LIMIT;

	const params = new URLSearchParams({ offset, limit });

	if (state.filters.title) params.set("title", state.filters.title);
	if (state.filters.categoryId)
		params.set("categoryId", state.filters.categoryId);
	if (state.filters.price_min) params.set("price_min", state.filters.price_min);
	if (state.filters.price_max) params.set("price_max", state.filters.price_max);

	return params.toString();
}

async function fetchProducts() {
	showLoading();
	try {
		const [countRes, pageRes] = await Promise.all([
			fetch(`${API_BASE}/products?${buildQueryParams(true)}`),
			fetch(`${API_BASE}/products?${buildQueryParams(false)}`),
		]);

		const allProducts = await countRes.json();
		const pageProducts = await pageRes.json();

		state.totalProducts = Array.isArray(allProducts) ? allProducts.length : 0;

		renderProducts(pageProducts);
		renderPagination();
	} catch (err) {
		showError();
		console.error("Erro ao buscar produtos:", err);
	}
}

function renderProducts(products) {
	if (!Array.isArray(products) || products.length === 0) {
		productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-2x"></i>
                <p>Nenhum produto encontrado.</p>
            </div>`;
		return;
	}

	productsGrid.innerHTML = products
		.map(
			(product) => `
        <article class="product-card" onclick="openDetails(${product.id})" style="cursor:pointer">
    <img
        src="${getSafeImage(product.images)}"
        alt="${product.title}"
        loading="lazy"
        onerror="this.src='https://placehold.co/400x300?text=Sem+Imagem'"
    >
    <div class="product-card-body">
        <span class="product-card-category">${product.category?.name ?? ""}</span>
        <h3 class="product-card-title">${product.title}</h3>
        <span class="product-card-price">${formatPrice(product.price)}</span>
    </div>
</article>
    `,
		)
		.join("");
}

function renderPagination() {
	const totalPages = Math.ceil(state.totalProducts / LIMIT);
	if (totalPages <= 1) {
		pagination.innerHTML = "";
		return;
	}

	const { currentPage } = state;
	let html = "";

	html += `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>`;

	getPageRange(currentPage, totalPages).forEach((p) => {
		if (p === "...") {
			html += `<span class="page-btn" style="cursor:default;border:none">…</span>`;
		} else {
			html += `<button class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
		}
	});

	html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>`;

	pagination.innerHTML = html;

	pagination.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const page = Number(btn.dataset.page);
			if (page !== state.currentPage) {
				state.currentPage = page;
				fetchProducts();
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	});
}

function getPageRange(current, total) {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const pages = new Set(
		[1, total, current, current - 1, current + 1].filter(
			(p) => p >= 1 && p <= total,
		),
	);
	const sorted = [...pages].sort((a, b) => a - b);

	const result = [];
	let prev = 0;
	for (const p of sorted) {
		if (p - prev > 1) result.push("...");
		result.push(p);
		prev = p;
	}
	return result;
}

function showLoading() {
	productsGrid.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando produtos...</p>
        </div>`;
	pagination.innerHTML = "";
}

function showError() {
	productsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle fa-2x" style="color:#e53935"></i>
            <p>Erro ao carregar produtos. Tente novamente.</p>
        </div>`;
}

function applyFilters() {
	state.filters.categoryId = filterCategory.value;
	state.filters.price_min = filterPriceMin.value;
	state.filters.price_max = filterPriceMax.value;
	state.currentPage = 1;
	fetchProducts();
	closeFilterDrawer();
}

function clearFilters() {
	state.filters = { title: "", categoryId: "", price_min: "", price_max: "" };
	filterCategory.value = "";
	filterPriceMin.value = "";
	filterPriceMax.value = "";
	searchInput.value = "";
	state.currentPage = 1;
	fetchProducts();
}

function setupEvents() {
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeFilterDrawer();
	});
	searchForm.addEventListener("submit", (e) => {
		e.preventDefault();
		state.filters.title = searchInput.value.trim();
		state.currentPage = 1;
		fetchProducts();
	});
	openBtn?.addEventListener("click", openFilterDrawer);
	closeBtn?.addEventListener("click", closeFilterDrawer);
	overlay?.addEventListener("click", closeFilterDrawer);
	btnFilterMobile?.addEventListener("click", openFilterDrawer);
	btnApply?.addEventListener("click", applyFilters);
	btnClear?.addEventListener("click", clearFilters);
}

async function initCatalog() {
	bindElements();
	setupEvents();
	await loadCategories();
	await fetchProducts();
}

async function openDetails(id) {
	localStorage.setItem("selectedProductId", id);
	await loadApp("details");
	await loadFooter("footer");
	initDetails();
}
