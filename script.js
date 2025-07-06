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

let currentUID = null;
let currentConversationId = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUID = user.uid;
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "flex";
    loadConversationHistory();
    startNewConversation();
  }
});

function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "flex";
      forceScrollToTop();
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}

function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (password !== confirm) {
    document.getElementById("authStatus").textContent = "❌ Mots de passe différents.";
    return;
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
    currentUID = null;
    currentConversationId = null;
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
      body: JSON.stringify({ prompt: message, uid: currentUID, conversationId: currentConversationId })
    });

    const data = await res.json();
    currentConversationId = data.conversationId;
    await loadConversationHistory();

    const optimized = data.response || "⚠️ Erreur IA.";
    updateLastBotMessage(optimized);

    const actions = document.createElement("div");
    actions.className = "chat-actions";
    actions.innerHTML = `
      <a href="#" onclick="sendToChat(this)">💬 Envoyer à l'IA</a> |
      <a href="#" onclick="copyFromText(this)">📋 Copier</a>
    `;
    document.getElementById("chatContainer").appendChild(actions);
    scrollToBottom();
  } catch {
    updateLastBotMessage("⚠️ Erreur réseau.");
  }
}

function appendMessage(text, type) {
  if (!text || !text.trim()) return; // ⛔ ignore les messages vides

  const msg = document.createElement("div");
  msg.className = `chat-message ${type}`;
  msg.textContent = text;
  document.getElementById("chatContainer").appendChild(msg);
  scrollToBottom();

  // ✅ Enregistre uniquement si conversation existe
  if (currentUID && currentConversationId && text.trim().length > 0) {
    fetch(`${backendURL}/message/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: currentUID,
        conversationId: currentConversationId,
        role: type,
        text: text.trim()
      })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.warn("⚠️ Erreur sauvegarde message :", data);
      }
    })
    .catch(err => console.error("❌ Sauvegarde échouée :", err));
  }
}



function updateLastBotMessage(text) {
  const messages = document.querySelectorAll(".chat-message.bot");
  if (messages.length > 0) {
    messages[messages.length - 1].textContent = text;
  }
}

function scrollToBottom() {
  const container = document.getElementById("chatContainer");
  container.scrollTop = container.scrollHeight;
}

function sendToChat(linkElement) {
  const botMessages = document.querySelectorAll(".chat-message.bot");
  if (!botMessages.length) return;

  const prompt = botMessages[botMessages.length - 1].textContent.trim();
  appendMessage(prompt, "user");
  appendMessage("🤖 Réponse en cours…", "bot");

  if (linkElement?.parentElement) linkElement.parentElement.remove();

  fetch(`${backendURL}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, uid: currentUID, conversationId: currentConversationId })
  })
    .then(res => res.json())
    .then(data => {
      updateLastBotMessage(data.response || "⚠️ Erreur IA.");
      const copy = document.createElement("div");
      copy.className = "chat-actions";
      copy.innerHTML = `<a href="#" onclick="copyFromText(this)">📋 Copier la réponse</a>`;
      document.getElementById("chatContainer").appendChild(copy);
      scrollToBottom();
    })
    .catch(() => updateLastBotMessage("⚠️ Erreur réseau."));
}

function copyFromText(link) {
  const msg = link.closest(".chat-container").querySelector(".chat-message.bot:last-of-type");
  if (msg) {
    navigator.clipboard.writeText(msg.textContent).then(() => alert("✅ Copié !"));
  }
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

async function loadConversationHistory() {
  const res = await fetch(`${backendURL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: currentUID })
  });

  const data = await res.json();
  const list = document.getElementById("conversationList");
  list.innerHTML = "";

  (data.conversations || []).forEach(c => {
    const li = document.createElement("li");
    li.textContent = c.preview.slice(0, 40) + "...";
    li.onclick = () => loadConversation(c.id);
    list.appendChild(li);
  });
}

async function loadConversation(conversationId) {
  try {
    console.log("📥 Chargement conversation ID :", conversationId);

    const res = await fetch(`${backendURL}/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId })
    });

    const data = await res.json();

    console.log("📦 Messages reçus :", data.messages); // ✅ ici !

    const container = document.getElementById("chatContainer");
    container.innerHTML = "";

    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = "<p style='color: #94a3b8; font-style: italic;'>Aucun message dans cette conversation.</p>";
      return;
    }

    currentConversationId = conversationId;

    data.messages.forEach(m => {
      console.log("✉️ Message :", m.role, m.text); // 🔍 utile
      appendMessage(m.text, m.role);
    });

    scrollToBottom();
  } catch (err) {
    console.error("❌ Erreur chargement conversation :", err);
  }
}


async function startNewConversation(force = false) {
  if (!force && isCurrentConversationEmpty()) {
    console.log("🚫 Conversation vide — aucune nouvelle discussion créée.");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/new_conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: currentUID })
    });

    const data = await res.json();
    if (!data.conversationId) {
      alert("Erreur lors de la création de la conversation");
      return;
    }

    currentConversationId = data.conversationId;
    document.getElementById("chatContainer").innerHTML = "";
    await loadConversationHistory();
  } catch (err) {
    console.error("❌ Erreur nouvelle conversation :", err);
  }
}


function toggleHistory() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleHistoryBtn");

  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
    toggleBtn.textContent = "📁 Masquer l’historique";
  } else {
    sidebar.style.display = "none";
    toggleBtn.textContent = "📂 Afficher l’historique";
  }
}
function isCurrentConversationEmpty() {
  const userMessages = document.querySelectorAll(".chat-message.user");
  return userMessages.length === 0;
}

function handleNewConversation() {
  // 👉 on vérifie s’il y a au moins un message utilisateur
  if (isCurrentConversationEmpty()) {
    alert("⚠️ Tu n’as encore rien écrit dans cette conversation.");
    return;
  }

  // ✅ Lancer la nouvelle conversation
  startNewConversation(true);
}
