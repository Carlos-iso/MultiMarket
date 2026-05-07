const URL_BASE = 'https://api.escuelajs.co/api/v1';
const STORAGE_REGISTERED_USERS_KEY = 'registered_users';

// -*-*-*- FUNÇÃO DE EXIBIÇÃO DE MENSAGEM *-*-*-*-

function displayMessage(texto, tipo = 'erro') {
	const msgElement = document.getElementById('error-message');

	if (msgElement){
		msgElement.textContent = texto;
		msgElement.style.color = tipo === 'erro' ? '#ff4d4d' : '#10b981'; // Não definir cor no css
		msgElement.style.display = 'block' ;

		setTimeout(() => {
			msgElement.style.display = 'none';
		}, 3000); 
	}
}

function normalizeEmail(email) {
	return email.trim().toLowerCase();
}

function isEmailValid(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}


function togglePasswordVisibility() {
	const password = document.getElementById("reg-password");
	const eyeicon = document.getElementById("eyeicon");
	const confirmPassword = document.getElementById("reg-confirm-password");
	const eyeiconconfirm = document.getElementById("eyeicon-confirm");

	
	if (eyeicon && password) {
		eyeicon.addEventListener('click', () => {
			if (password.type === 'password') {
				password.type = 'text';
				eyeicon.src = '../src/assets/icons/eye-open.svg';
			} else {
				password.type = 'password';
				eyeicon.src = '../src/assets/icons/eye-close.svg';
			}
		});
	}

	if (eyeiconconfirm && confirmPassword) {
		eyeiconconfirm.addEventListener('click', () => {
			if (confirmPassword.type === 'password') {
				confirmPassword.type = 'text';
				eyeiconconfirm.src = '../src/assets/icons/eye-open.svg';
			} else {
				confirmPassword.type = 'password';
				eyeiconconfirm.src = '../src/assets/icons/eye-close.svg';
			}
		});
	}
}
togglePasswordVisibility();

function validatePassword() {    

	let passwordInput = document.getElementById('reg-password');
	let confirmPasswordInput = document.getElementById('reg-confirm-password');
    
	if (passwordInput.value !== confirmPasswordInput.value) {
		displayMessage('As senhas não coincidem. Por favor, verifique.', 'erro');
		confirmPasswordInput.setCustomValidity('As senhas não coincidem. Por favor, verifique.');

		passwordInput.style.borderColor = '#ff4d4d';
		confirmPasswordInput.style.borderColor = '#ff4d4d';
		return false;
	} else {
		passwordInput.style.borderColor = '';
		confirmPasswordInput.style.borderColor = '';
		passwordInput.setCustomValidity('');
		confirmPasswordInput.setCustomValidity('');
		return true;
	}
}



function isPasswordLengthValid() {
	const passwordInputElement = document.getElementById('reg-password');
	const passwordValue = passwordInputElement?.value || '';

	if (passwordValue.length < 6 || passwordValue.length > 8) {
		displayMessage('A senha deve conter entre 6 e 8 caracteres.', 'erro');
		passwordInputElement?.setCustomValidity('A senha deve conter entre 6 e 8 caracteres.');
		if (passwordInputElement) passwordInputElement.style.borderColor = '#ff4d4d';
		return false;
	} else {
		if (passwordInputElement) {
			passwordInputElement.style.borderColor = '';
			passwordInputElement.setCustomValidity('');
		}
		return true;
	}
}


function validateForm() {
	const emailValid = validateEmailField();
	const passwordValid = validatePassword();
	const lengthValid = isPasswordLengthValid();

	if (!emailValid || !passwordValid || !lengthValid) {
		return false;
	}

	return true;
}

function toArray(valor) {
	if (!valor) {
		return [];
	}

	if (Array.isArray(valor)) {
		return valor.filter(Boolean);
	}

	return [valor].filter(Boolean);
}

function readStorageJSON(chave) {
	try {
		return JSON.parse(localStorage.getItem(chave));
	} catch (error) {
		console.error(`Erro ao ler ${chave} do localStorage:`, error);
		return null;
	}
}

function getRegisteredUsers() {
	const usuariosRegistrados = toArray(readStorageJSON(STORAGE_REGISTERED_USERS_KEY));

	if (usuariosRegistrados.length > 0) {
		return usuariosRegistrados;
	}

	const usuariosLegados = toArray(readStorageJSON('users'));

	if (usuariosLegados.length > 0) {
		localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(usuariosLegados));
		return usuariosLegados;
	}

	return [];
}

function saveRegisteredUser(usuario) {
	const emailNormalizado = normalizeEmail(usuario?.email || '');

	if (!emailNormalizado) {
		return;
	}

	const usuariosRegistrados = getRegisteredUsers().filter((item) => {
		return normalizeEmail(item?.email || '') !== emailNormalizado;
	});

	usuariosRegistrados.push({
		...usuario,
		email: emailNormalizado
	});

	localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(usuariosRegistrados));
}

function emailExistsInUsers(usuarios, email) {
	const emailNormalizado = normalizeEmail(email);

	return toArray(usuarios).some((usuario) => {
		return normalizeEmail(usuario?.email || '') === emailNormalizado;
	});
}

async function fetchUsersFromApi() {
	try {
		const response = await fetch(`${URL_BASE}/users?offset=0&limit=1000`);

		if (!response.ok) {
			return {
				ok: false,
				users: []
			};
		}

		const data = await response.json();

		return {
			ok: true,
			users: toArray(data)
		};
	} catch (error) {
		console.error('Erro ao buscar usuários da API:', error);

		return {
			ok: false,
			users: []
		};
	}
}


// -*-*-*- VERIFICAÇÃO DE DISPONIBILIDADE DE E-MAIL *-*-*-*-
async function checkEmailAvailability(email) {
	const emailNormalizado = normalizeEmail(email);
	const usuariosRegistrados = getRegisteredUsers();

	if (emailExistsInUsers(usuariosRegistrados, emailNormalizado)) {
		return {
			ok: true,
			isAvailable: false
		};
	}

	try {
		// Endpoint oficial de disponibilidade de e-mail do projeto.
		const response = await fetch(`${URL_BASE}/users/is-available`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: emailNormalizado })
		});

		if (!response.ok) {
			return {
				ok: false,
				isAvailable: false
			};
		}

		const data = await response.json();

		if (typeof data?.isAvailable === 'boolean') {
			if (data.isAvailable) {
				return {
					ok: true,
					isAvailable: true
				};
			}

			// Fallback para contornar respostas inconsistentes da API pública.
			const { ok, users } = await fetchUsersFromApi();

			if (!ok) {
				return {
					ok: true,
					isAvailable: false
				};
			}

			return {
				ok: true,
				isAvailable: !emailExistsInUsers(users, emailNormalizado)
			};
		}

		return {
			ok: false,
			isAvailable: false
		};
	} catch (error) {
		console.error('Erro ao verificar disponibilidade do e-mail:', error);
		return {
			ok: false,
			isAvailable: false
		};
	}
}


function clearEmailFieldState() {
	if (!emailInput) {
		return;
	}

	emailInput.setCustomValidity('');
	emailInput.style.borderColor = '';
}



function updateEmailFieldState({
	mensagem = '',
	tipo = 'erro',
	borderColor = '',
	customValidity = '',
	reportValidity = false
}) {
	if (!emailInput) {
		return;
	}

	emailInput.style.borderColor = borderColor;
	emailInput.setCustomValidity(customValidity);

	if (mensagem) {
		displayMessage(mensagem, tipo);
	}

	if (reportValidity) {
		emailInput.reportValidity();
	}
}

// -*-*-*- FUNÇÃO DE VALIDAÇÃO DE E-MAIL NO CAMPO DE REGISTRO *-*-*-*-
async function validateEmailField() {
	if (!emailInput) {
		return true;
	}

	const email = normalizeEmail(emailInput.value);

	if (!email) {
		return true;
	}

	clearEmailFieldState();

	// email format validation
	if (!isEmailValid(email)) {
		updateEmailFieldState({
			mensagem: 'Informe um e-mail válido.',
			tipo: 'erro',
			borderColor: '#ff4d4d',
			customValidity: 'Informe um e-mail válido.',
			reportValidity: true
		});
		return false;
	}

	emailInput.value = email;

	try {
		const { ok, isAvailable } = await checkEmailAvailability(email);

		if (!ok) {
			updateEmailFieldState({
				mensagem: 'Não foi possível verificar a disponibilidade do e-mail agora. Tente novamente.',
				tipo: 'erro'
			});
			return false;
		}

		if (!isAvailable) {
			updateEmailFieldState({
				mensagem: 'Este e-mail já está cadastrado. Use outro e-mail.',
				tipo: 'erro',
				borderColor: '#ff4d4d',
				customValidity: 'Este e-mail já está cadastrado.',
				reportValidity: true
			});
			return false;
		}

		updateEmailFieldState({
			mensagem: 'E-mail disponível!',
			tipo: 'sucesso',
			borderColor: '#2ecc71'
		});
		return true;

	} catch (error) {
		console.error('Erro na verificação:', error);
		updateEmailFieldState({
			mensagem: 'Erro de conexão ao verificar a disponibilidade do e-mail.',
			tipo: 'erro'
		});
		return false;
	}
}



const emailInput = document.getElementById('reg-email');
if (emailInput){
	
	emailInput.addEventListener('blur', async () => {
		await validateEmailField();
	});

	
	emailInput.addEventListener('input', () => {
		clearEmailFieldState();
	});
}



const registerForm = document.getElementById('register-form');
if(registerForm){
    
	// -*-*-*- FUNÇÃO DE CADASTRO *-*-*-*-
	registerForm.addEventListener('submit', async (event) => {
	  event.preventDefault();


	formIsValid = validateForm();
	// passwordUpper = isPasswordLengthValid();

	if (!formIsValid) {
		return;
	}


	  // Dados do usuário a ser cadastrado
	const userData = {
		name: document.getElementById('reg-name').value,
		email: normalizeEmail(document.getElementById('reg-email').value),
		password: document.getElementById('reg-password').value,
		avatar: "https://picsum.photos/80"
	  };

      

	try{

		// -*-*-*-*- REQUISIÇÃO PARA CADASTRO DE USUÁRIO -*-*-*-*-
		const response = await fetch(`${URL_BASE}/users`,{
		  method: 'POST', 
		  headers: {'Content-Type': 'application/json'},
		  body: JSON.stringify(userData)
		});
    
		const data = await response.json();
    
		if(response.ok){
			localStorage.setItem('userId', data.id)
			saveRegisteredUser(data);
			displayMessage('Usuário criado com sucesso! Agora faça o login', 'sucesso');

			// Time para o usuário ler a mensagem antes de redirecionar para a página de login
			setTimeout(() => {
				window.location.href = '../pages/login.html';
			}, 5000);    
		}

		else{
			displayMessage('Erro no cadastro: ' + data.message, 'erro');
			console.error('Erro no cadastro:', data);
		}
    
	} catch (error) {
			displayMessage('Erro na requisição. Verifique a sua conexão.', 'erro');
			console.error('Erro na requisição:', error);
		}
    
	});

};
