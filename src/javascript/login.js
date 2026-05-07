const URL_BASE = "https://api.escuelajs.co/api/v1";

// -*-*-*- FUNÇÃO DE EXIBIÇÃO DE MENSAGEM *-*-*-*-

function displayMessage(texto, tipo = "erro") {
	const msgElement = document.getElementById("error-message");

	if (msgElement) {
		msgElement.textContent = texto;
		msgElement.style.color = tipo === "erro" ? "#ff4d4d" : "#10b981"; // Não definir cor no css
		msgElement.style.display = "block";

		setTimeout(() => {
			msgElement.style.display = "none";
		}, 5000); // Rever o tempo de exibição da mensagem depois
	}
}

function normalizeEmail(email) {
	return email.trim().toLowerCase();
}

function isEmailValid(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function renewTokens() {
	const refreshToken = localStorage.getItem("refresh_token");

	if (!refreshToken) {
		return false;
	}

	try {
		const response = await fetch(`${URL_BASE}/auth/refresh-token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			return false;
		}

		const data = await response.json();

		if (!data?.access_token || !data?.refresh_token) {
			return false;
		}

		localStorage.setItem("access_token", data.access_token);
		localStorage.setItem("refresh_token", data.refresh_token);

		return true;
	} catch (error) {
		console.error("Erro ao renovar token:", error);
		return false;
	}
}

// function to toggle password visibility
function togglePasswordVisibility() {
	let password = document.getElementById("password");
	let eyeicon = document.getElementById("eyeicon");

	if (!password || !eyeicon) {
		return;
	}

	eyeicon.onclick = function () {
		if (password.type == "password") {
			password.type = "text";
			eyeicon.src = "../src/assets/icons/eye-open.svg";
		} else {
			password.type = "password";
			eyeicon.src = "../src/assets/icons/eye-close.svg";
		}
	};
}
togglePasswordVisibility();

const loginForm = document.getElementById("login-form");
if (loginForm) {
	// -*-*-*- FUNÇÃO DE LOGIN *-*-*-*-
	document
		.getElementById("login-form")
		.addEventListener("submit", async (event) => {
			event.preventDefault();

			const email = normalizeEmail(document.getElementById("log-email").value);

			if (!isEmailValid(email)) {
				displayMessage("Please enter a valid email.", "erro");
				return;
			}

			const loginData = {
				email,
				password: document.getElementById("password").value,
			};

			// Tratamento de erro
			try {
				const response = await fetch(`${URL_BASE}/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(loginData),
				});

				const data = await response.json();

				if (response.ok) {
					// -*-*-*-*- GUARDANDO O TOKEN NO LOCALSTORAGE -*-*-*-*-

					localStorage.setItem("access_token", data.access_token);
					localStorage.setItem("refresh_token", data.refresh_token);

					displayMessage("Login successful! Token saved.", "sucesso");

					console.log("Token JWT:", data.access_token); // lembrar de apagar depois
					console.log("Refresh Token:", data.refresh_token); // lembrar de apagar depois

					// Redirecionar para a página de perfil ou dashboard
					window.location.href = "/index.html";
				} else {
					displayMessage("Login failed: Check your credentials.", "erro");
					console.error("Falha no login:", data.message); // lembrar de apagar depois
				}
			} catch (error) {
				displayMessage("Server error while attempting login.", "erro");
				console.error("Erro no login:", error); // lembrar de apagar depois
			}
		});
}

// --- BUSCAR PERFIL (ROTA PROTEGIDA) ---
async function fetchUserData() {
	const token = localStorage.getItem("access_token");

	if (!token) {
		doLogout();
		return;
	}

	try {
		const response = await fetch(`${URL_BASE}/auth/profile`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		if (response.ok) {
			const user = await response.json();
			localStorage.setItem("userId", user.id);

			// update UI name
			const welcomeMsg = document.getElementById("welcome-message");
			if (welcomeMsg) welcomeMsg.innerHTML = `Hello, ${user.name}!`;

			// update avatar if exists
			const avatarImg = document.getElementById("user-avatar");
			if (avatarImg) avatarImg.src = user.avatar;
		} else if (response.status === 401 || response.status === 403) {
			const renewed = await renewTokens();

			if (renewed) {
				await fetchUserData();
				return;
			}

			displayMessage(
				"Session expired or invalid. Please log in again.",
				"erro",
			);
			doLogout();
		} else {
			displayMessage("Error loading profile. Please try again.", "erro");
		}
	} catch (error) {
		displayMessage("Error loading profile. Please try again.", "erro");
		console.error("Error loading profile:", error);
	}
}

// -*-*-*- FUNÇÃO DE LOGOUT COM LIMPEZA DE DADOS *-*-*-*-

function doLogout() {
	localStorage.removeItem("access_token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("userId");
	localStorage.removeItem("users");
	const redirectTo = window.location.pathname.includes("/pages/")
		? "../index.html"
		: "index.html";
	window.location.href = redirectTo;
}

document.addEventListener("DOMContentLoaded", () => {
	const profileElements =
		document.getElementById("welcome-message") &&
		document.getElementById("user-avatar");

	if (profileElements) {
		fetchUserData();
	}
});
