const firebaseConfig = {
  apiKey: "AIzaSyAiBioPsbDZT3nrMgeHdntS0QIXjQTIzIk",
  authDomain: "prompt-app-d4692.firebaseapp.com",
  projectId: "prompt-app-d4692",
  storageBucket: "prompt-app-d4692.firebasestorage.app",
  messagingSenderId: "1090823184353",
  appId: "1:1090823184353:web:86a03e89a3e632e402bca0"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "block";
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = error.message;
    });
}

function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    document.getElementById("authStatus").textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "block";
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = error.message;
    });
}

function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value;
  auth.sendPasswordResetEmail(email)
    .then(() => {
      document.getElementById("resetStatus").textContent = "Email envoyé avec succès.";
    })
    .catch(error => {
      document.getElementById("resetStatus").textContent = error.message;
    });
}

function signOut() {
  auth.signOut().then(() => {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  });
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function showSignUp() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("resetSection").style.display = "none";
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "none";
}

function showReset() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "block";
}

function generatePrompt() {
  const userPrompt = document.getElementById("userPrompt").value;
  const optimized = `Voici un prompt optimisé basé sur votre idée : "${userPrompt}"`;
  document.getElementById("optimizedPrompt").textContent = optimized;
}

function getAIResponse() {
  const prompt = document.getElementById("optimizedPrompt").textContent;
  const fakeResponse = `Réponse IA simulée basée sur : "${prompt}"`;
  document.getElementById("aiResponse").textContent = fakeResponse;
}

function copyText(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copié dans le presse-papiers !");
  });
}
