const URL_BASE = "https://api.escuelajs.co/api/v1";

const LOGIN_PAGE = "/pages/login.html";

function displayMessage(texto, tipo = "erro") {
	const msgElement = document.getElementById("profile-message");

	if (!msgElement) {
		return;
	}

	msgElement.textContent = texto;
	msgElement.dataset.tipo = tipo;
	msgElement.style.display = "block";

	window.clearTimeout(msgElement._hideTimer);
	msgElement._hideTimer = setTimeout(() => {
		msgElement.style.display = "none";
	}, 3500);
}

function normalizeText(valor, fallback = "") {
	return valor === null || valor === undefined || valor === ""
		? fallback
		: String(valor);
}

function fillProfile(usuario) {
	const avatar = document.getElementById("profile-avatar");
	const titulo = document.getElementById("profile-title");
	const campoId = document.getElementById("profile-id");
	const campoName = document.getElementById("profile-name-field");
	const campoEmail = document.getElementById("profile-email-field");
	const campoRole = document.getElementById("profile-role-field");
	const campoPassword = document.getElementById("profile-password-field");

	if (titulo) {
		titulo.textContent = `Perfil de ${normalizeText(usuario?.name, "Usuário")}`;
	}

	if (campoId) {
		campoId.value = `${normalizeText(usuario?.id, "-")}`;
	}

	if (campoName) {
		campoName.value = `${normalizeText(usuario?.name, "-")}`;
	}

	if (campoEmail) {
		campoEmail.value = `${normalizeText(usuario?.email, "-")}`;
	}

	if (campoRole) {
		campoRole.value = `${normalizeText(usuario?.role, "-")}`;
	}

	if (campoPassword) {
		campoPassword.value = "********";
	}

	if (avatar) {
		const avatarUrl =
			usuario && usuario.avatar && usuario.avatar.trim()
				? usuario.avatar
				: "https://api.lorem.space/image/face?w=200&h=200";

		avatar.src = avatarUrl;

		const fallbackAvatar = "../src/assets/icons/profile-icon.svg";
		avatar.onerror = function () {
			this.onerror = null;
			this.src = fallbackAvatar;
		};
		avatar.alt = usuario?.name ? `Foto de ${usuario.name}` : "Foto do usuário";
	}
}

function patch() {
	const avatar = document.getElementById("profile-avatar");

	if (!avatar) {
		return;
	}
	avatar.src = "../src/assets/icons/perfil.svg";
	avatar.alt = "Foto do usuário";
}

async function loadProfile() {
	setTitle("Perfil - MultiMarket");
	await loadFooter("footer");
	const token = localStorage.getItem("access_token");

	if (!token) {
		window.location.href = LOGIN_PAGE;
		return;
	}

	try {
		const response = await fetch(`${URL_BASE}/auth/profile`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		}).then((res) => {
			if (res.status === 401 || res.status === 403) {
				throw new Error("Unauthorized");
			}
			return res;
		});

		if (!response.ok) {
			throw new Error(
				`Erro ao buscar perfil: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		fillProfile(data);
		setTitle(`Perfil de ${data?.name || "Usuário"} - MultiMarket`);
	} catch (error) {
		displayMessage("Error loading profile. Please log in again.", "erro");
		window.location.href = LOGIN_PAGE;
	}
}

function toggleEdit(id) {
	const input = document.getElementById(id);

	if (!input) return;

	input.readOnly = !input.readOnly;

	if (!input.readOnly) {
		input.focus();
	}
}

async function updateProfile(event) {
	if (event) {
		event.preventDefault();
	}

	const id = document.getElementById("profile-id")?.value;

	const name = document.getElementById("profile-name-field")?.value.trim();

	const password = document
		.getElementById("profile-password-field")
		?.value.trim();

	const token = localStorage.getItem("access_token");

	if (!token) {
		displayMessage("Sessão inválida.", "erro");

		return;
	}

	const body = {};

	if (name) {
		body.name = name;
	}

	if (password && password !== "********") {
		body.password = password;
	}

	try {
		const response = await fetch(`${URL_BASE}/users/${id}`, {
			// API rejeita essa rota mesmo passando o token, então não tem muito o que fazer além de fingir que funcionou
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error("Erro ao atualizar");
		}

		const updated = await response.json();

		fillProfile(updated);

		document.getElementById("profile-name-field").readOnly = true;

		document.getElementById("profile-password-field").readOnly = true;

		document.getElementById("profile-password-field").value = "********";

		displayMessage("Perfil atualizado.", "sucesso");
	} catch (error) {
		displayMessage("Erro ao atualizar perfil.", "erro");
	}
}

function initProfilePage() {
	setupNavigation();
	setupLogout();

	loadProfile().catch((error) => {
		displayMessage("Error loading profile. Please try again.", "erro");
	});

	const profileConfirmBtn = document.getElementById("profile-refresh");
	if (profileConfirmBtn) {
		profileConfirmBtn.addEventListener("click", updateProfile);
	}
}

function setupLogout() {

    const logout =
        document.getElementById("profile-logout");

    if (!logout) return;

    logout.addEventListener("click", () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = LOGIN_PAGE;
    });
}

// Funções de navegação
function setupNavigation() {
	const navShop = document.getElementById("nav-shop");
	const navCategorias = document.getElementById("nav-categorias");
	const navPerfil = document.getElementById("nav-perfil");

	if (navShop) {
		navShop.addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}

	if (navCategorias) {
		navCategorias.addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}

	if (navPerfil) {
		navPerfil.addEventListener("click", () => {
			window.location.href = "./profile.html";
		});
	}
}

window.addEventListener("app:pageLoaded", (e) => {
	if (e.detail?.page === "profile") initProfilePage();
});

if (
	document.readyState !== "loading" &&
	document.getElementById("profile-avatar")
) {
	initProfilePage();
} else {
	document.addEventListener("DOMContentLoaded", () => {
		if (document.getElementById("profile-avatar")) initProfilePage();
	});
}
