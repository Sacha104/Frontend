// === Configuration Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyBzEFTyOLMinVglWBmGSVqCwCtUfg40-l8",
  authDomain: "prompt-app-82523.firebaseapp.com",
  projectId: "prompt-app-82523",
  storageBucket: "prompt-app-82523.appspot.com",
  messagingSenderId: "573537645411",
  appId: "1:573537645411:web:da0782831b6358db319956"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const backendURL = "https://prompt-ai-naa1.onrender.com";

// === Génération de prompt ===
async function generatePrompt() {
  const userPrompt = document.getElementById("userPrompt").value.trim();
  if (!userPrompt) {
    alert("Veuillez entrer une idée ou une demande.");
    return;
  }

  document.getElementById("optimizedPrompt").textContent = "⏳ Génération en cours…";
  document.getElementById("aiResponse").textContent = "Aucune réponse générée pour l’instant.";

  try {
    const response = await fetch(`${backendURL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt })
    });

    const data = await response.json();
    document.getElementById("optimizedPrompt").textContent = data.response || "Erreur dans la génération.";
    document.getElementById("generatedPromptBox").style.display = "block";
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la génération.");
  }
}

// === Réponse IA ===
async function getAIResponse() {
  const improvedPrompt = document.getElementById("optimizedPrompt").textContent.trim();
  if (!improvedPrompt) {
    alert("Aucun prompt optimisé.");
    return;
  }

  document.getElementById("aiResponse").textContent = "🤖 Réponse en cours…";

  try {
    const response = await fetch(`${backendURL}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: improvedPrompt })
    });

    const data = await response.json();
    document.getElementById("aiResponse").innerHTML = marked.parse(data.response || "Erreur.");
    document.getElementById("aiResponseBox").style.display = "block";
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la réponse.");
  }
}

// === Copier du texte ===
function copyText(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => alert("Texte copié !"));
}

// === Authentification ===
function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "✅ Connecté !";
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = "❌ " + error.message;
    });
}

function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!email || !password || !confirmPassword) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Les mots de passe ne correspondent pas.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "✅ Inscription réussie !";
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = "❌ " + error.message;
    });
}

function forgotPassword() {
  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    alert("Veuillez entrer votre email.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => alert("📧 Email de réinitialisation envoyé !"))
    .catch(error => alert("❌ " + error.message));
}

function signOut() {
  auth.signOut().then(() => {
    document.getElementById("authStatus").textContent = "👋 Déconnecté.";
  });
}

// === Changement d'état ===
auth.onAuthStateChanged(user => {
  const authSection = document.getElementById("authSection");
  const appSection = document.getElementById("appSection");

  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// === Bascule Login / SignUp ===
function showSignUp() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("authStatus").textContent = "";
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("authStatus").textContent = "";
}

// === Affichage mot de passe ===
function togglePassword(inputId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(iconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}
