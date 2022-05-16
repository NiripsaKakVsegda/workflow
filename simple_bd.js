function register() {
    const nickname = document.registerForm.nickname.value;
    const email = document.registerForm.email.value;
    const password = document.registerForm.password.value;
    const repeatedPassword = document.registerForm.repeatedPassword.value;

    if (localStorage.getItem(nickname))
        alert("Данный никнейм уже занят");
    else if (localStorage.getItem(email))
        alert("Данные Email уже зарегестрирован");
    else if (password !== repeatedPassword)
        alert("Пароли не совпадают");
    else {
        localStorage.setItem(nickname, password)
        localStorage.setItem(email, password)
        alert("Вы успешно зарегестрировались!")
    }
}


function login() {
    const loginField = document.loginForm.loginField.value;
    const password = document.loginForm.password.value;
    if (localStorage.getItem(loginField) !== password)
        alert("Неверный логин или пароль");
    else{
        // магия входа в систему
        alert("Вы успешно вошли в систему!")
    }
}