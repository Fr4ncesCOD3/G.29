// gestione login e register
document.getElementById("loginBtn").addEventListener("click", function () {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  this.classList.add("active");
  document.getElementById("registerBtn").classList.remove("active");
});

document.getElementById("registerBtn").addEventListener("click", function () {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  this.classList.add("active");
  document.getElementById("loginBtn").classList.remove("active");
});

// Gestione form di registrazione
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Controllo se l'utente è già registrato
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some(user => user.email === email);
    
    if (userExists) {
        alert("Un utente con questa email è già registrato!");
        return;
    }

    // Validazione password
    if (password.length < 8) {
        alert("La password deve contenere almeno 8 caratteri");
        return;
    }

    // Validazione conferma password
    if (password !== confirmPassword) {
        alert("Le password non coincidono");
        return;
    }

    // Creazione oggetto utente
    const newUser = {
        name,
        email,
        password
    };

    // Aggiunta del nuovo utente all'array e salvataggio
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("Registrazione completata con successo! Ora puoi effettuare il login.");
    
    // Reset form e switch al login
    this.reset();
    document.getElementById("loginBtn").click();
});

// Gestione form di login
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Recupero utenti dal localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Salva l'utente corrente
        localStorage.setItem("currentUser", JSON.stringify(user));
        // Login successful
        window.location.href = "./usersPage.html";
    } else {
        alert("Email o password non validi");
    }
});
