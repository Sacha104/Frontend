const firebaseConfig = {
  apiKey: "AIzaSyAiBioPsbDZT3nrMgeHdntS0QIXjQTIzIk",
  authDomain: "prompt-app-d4692.firebaseapp.com",
  projectId: "prompt-app-d4692",
  storageBucket: "prompt-app-d4692.appspot.com",
  messagingSenderId: "1090823184353",
  appId: "1:1090823184353:web:86a03e89a3e632e402bca0"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const backendURL = "https://prompt-ai-naa1.onrender.com";

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
  }
});

function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "block";
      forceScrollToTop();
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}

function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (password !== confirm) {
    return void (document.getElementById("authStatus").textContent = "❌ Mots de passe différents.");
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "✅ Inscription réussie.";
      showLogin();
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}

function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value;
  auth.sendPasswordResetEmail(email)
    .then(() => document.getElementById("resetStatus").textContent = "📧 Email envoyé.")
    .catch(e => document.getElementById("resetStatus").textContent = e.message);
}

function signOut() {
  auth.signOut().then(() => {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    forceScrollToTop();
  });
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  input.type = input.type === "password" ? "text" : "password";
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}

function handleChatEnter(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handleUserMessage();
  }
}

async function handleUserMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  appendMessage("⏳ Optimisation du prompt en cours…", "bot");

  try {
    const res = await fetch(`${backendURL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message })
    });
    const data = await res.json();
    const optimized = data.response || "⚠️ Erreur IA.";

    updateLastBotMessage(optimized);

    // Crée le bouton texte “Envoyer à l’IA” + bouton copier
    const actions = document.createElement("div");
    actions.className = "chat-actions";
    actions.innerHTML = `
      <a href="#" onclick="sendToChat(this)">💬 Envoyer à l'IA</a> |
      <a href="#" onclick="copyFromText(this)">📋 Copier</a>
    `;
    document.getElementById("chatContainer").appendChild(actions);

    document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
  } catch {
    updateLastBotMessage("⚠️ Erreur réseau.");
  }
}

function copyText(elId) {
  const text = document.getElementById(elId).textContent;
  navigator.clipboard.writeText(text).then(() => alert("✅ Copié !"));
}

function sendToChat(linkElement) {
  // Récupère le prompt optimisé juste au-dessus
  const botMessages = document.querySelectorAll(".chat-message.bot");
  if (botMessages.length === 0) return;
  const prompt = botMessages[botMessages.length - 1].textContent.trim();

  appendMessage(prompt, "user");
  appendMessage("🤖 Réponse en cours…", "bot");

  // Supprimer les actions associées (le lien)
  if (linkElement && linkElement.parentElement) {
    linkElement.parentElement.remove();
  }

  fetch(`${backendURL}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  })
    .then(res => res.json())
    .then(data => {
      updateLastBotMessage(data.response || "⚠️ Erreur IA.");

      // Ajouter bouton “copier” sous la réponse
      const copy = document.createElement("div");
      copy.className = "chat-actions";
      copy.innerHTML = `<a href="#" onclick="copyFromText(this)">📋 Copier la réponse</a>`;
      document.getElementById("chatContainer").appendChild(copy);
    })
    .catch(() => updateLastBotMessage("⚠️ Erreur réseau."));
}


function appendMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${type}`;
  msg.textContent = text;
  document.getElementById("chatContainer").appendChild(msg);
  document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
}

function updateLastBotMessage(text) {
  const messages = document.querySelectorAll(".chat-message.bot");
  if (messages.length > 0) {
    messages[messages.length - 1].textContent = text;
  }
}

function copyText(elId) {
  const text = document.getElementById(elId).textContent;
  navigator.clipboard.writeText(text).then(() => alert("✅ Copié !"));
}

function forceScrollToTop() {
  window.scrollTo(0, 0);
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
  document.getElementById("authStatus").textContent = "";
}

function showReset() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "block";
  document.getElementById("resetStatus").textContent = "";
}
