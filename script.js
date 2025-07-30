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

async function loadLastConversation() {
  try {
    const res = await fetch(`${backendURL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: currentUID })
    });

    const data = await res.json();
    const last = (data.conversations || []).find(c => !c.archived);
    if (last) await loadConversation(last.id);
    updateChatLayout();

  } catch (err) {
    console.error("Erreur chargement dernière conversation :", err);
  }
}


auth.onAuthStateChanged(user => {
  console.log(user ? "Utilisateur connecté" : "Aucun utilisateur connecté");

  const wrapper = document.querySelector(".wrapper");
  const icon = document.getElementById("accountIcon");

  if (user) {
    currentUID = user.uid;
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "flex";
    if (wrapper) wrapper.style.display = "none";
    if (icon) {
      icon.textContent = user.email[0].toUpperCase();
      icon.style.display = "flex";
    }

    // ✅ Charger l’historique ET la dernière conversation automatiquement
    loadConversationHistory();
    loadLastConversation();

  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    if (wrapper) wrapper.style.display = "flex";
    if (icon) icon.style.display = "none";
  }
});

function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "flex";
      const wrapper = document.querySelector(".wrapper");
      if (wrapper) wrapper.style.display = "none"; // ✅ Masquer .wrapper
      forceScrollToTop();
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}


function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (password !== confirm) {
    document.getElementById("authStatus").textContent = "Mots de passe différents.";
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "Inscription réussie.";
      showLogin();
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}

function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value;
  auth.sendPasswordResetEmail(email)
    .then(() => document.getElementById("resetStatus").textContent = "Email envoyé.")
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

  appendMessage("Optimisation du prompt en cours…", "bot");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70000); // ⏱️ 30 sec timeout

  try {
    const res = await fetch(`${backendURL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ prompt: message, uid: currentUID, conversationId: currentConversationId })
    });

    clearTimeout(timeout);

    const data = await res.json();
    currentConversationId = data.conversationId;
    await loadConversationHistory();

    const optimized = data.response || "Erreur IA.";
    updateLastBotMessage(optimized);

    const actions = document.createElement("div");
    actions.className = "chat-actions";
    scrollToBottom();
  } catch (error) {
    console.error("Erreur réseau :", error);
    updateLastBotMessage("Erreur réseau ou délai dépassé.");
  }
}

function appendMessage(text, type) {
  if (!text || !text.trim()) return; // ⛔ ignore les messages vides

  const msg = document.createElement("div");
  msg.className = `chat-message ${type}`;
  if (type === "bot") msg.classList.add("markdown");
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
        console.warn("Erreur sauvegarde message :", data);
      }
    })
    .catch(err => console.error("Sauvegarde échouée :", err));
  }
}




function updateLastBotMessage(text) {
  const messages = document.querySelectorAll(".chat-message.bot");
  if (messages.length === 0) return;

  const lastBotMsg = messages[messages.length - 1];
  const isFirstBotMessage = messages.length === 1;

  // Texte brut qui va être typé
  const plainText = text.trim();

  // Affichage progressif
  const typingDiv = document.createElement("div");
  typingDiv.className = "markdown";
  typingDiv.id = "typingArea";
  lastBotMsg.innerHTML = "";
  lastBotMsg.appendChild(typingDiv);

  // Ajoute bouton "Copier" en haut à droite si c'est le premier message
  if (isFirstBotMessage) {
    const copyBtn = document.createElement("div");
    copyBtn.className = "copy-button";
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
    copyBtn.onclick = () => navigator.clipboard.writeText(plainText);
    const copyRow = document.createElement("div");
    copyRow.className = "copy-button";
    copyRow.appendChild(copyBtn);
    lastBotMsg.appendChild(copyRow);
  }

  let index = 0;

  function typeNextChar() {
    if (index < plainText.length) {
      typingDiv.textContent += plainText.charAt(index);
      index++;
      setTimeout(typeNextChar, 12);
    } else {
      typingDiv.innerHTML = marked.parse(plainText);

      // Après écriture, on ajoute bouton "Envoyer à l'IA" si premier message
      if (isFirstBotMessage) {
        const chatContainer = document.getElementById("chatContainer");
        const actionRow = document.createElement("div");
        actionRow.className = "chat-actions";
        actionRow.innerHTML = `<a href="#" onclick="sendToChat(this)">Envoyer à l'IA</a>`;
        chatContainer.appendChild(actionRow);
        scrollToBottom();
      }
    }
  }

  typeNextChar();
}


function copyMessage(button) {
  // Empêche le comportement par défaut (utile si <a>)
  if (event) event.preventDefault();

  const msgContainer = button.closest(".chat-message.bot");
  if (!msgContainer) {
    console.error("Impossible de trouver .chat-message.bot");
    alert("Erreur : impossible de trouver le message à copier.");
    return;
  }

  const markdown = msgContainer.querySelector(".markdown");
  const msgText = markdown?.innerText;

  console.log("DEBUG copyText:", msgText);
}


function copyFromText(link) {
  const parent = link.closest(".chat-actions");
  const msg = parent?.previousElementSibling;
  if (msg?.classList.contains("chat-message") && msg?.classList.contains("bot")) {
    const text = msg.innerText.trim();
    navigator.clipboard.writeText(text)
      .then(() => alert("✅ Copié dans le presse-papiers"))
      .catch(() => alert("❌ Erreur lors de la copie"));
  }
}


function scrollToBottom() {
  const container = document.getElementById("chatContainer");
  container.scrollTop = container.scrollHeight;
}

function updateChatLayout() {
  const container = document.getElementById("chatContainer");
  const wrapper = document.querySelector(".main-content");

  if (!container || !wrapper) return;

  const hasMessages = container.querySelectorAll(".chat-message").length > 0;

  if (hasMessages) {
    wrapper.classList.remove("chat-wrapper-empty");
    wrapper.classList.add("chat-wrapper-active");
  } else {
    wrapper.classList.remove("chat-wrapper-active");
    wrapper.classList.add("chat-wrapper-empty");
  }
}

function sendToChat(linkElement) {
  const botMessages = document.querySelectorAll(".chat-message.bot");
  if (!botMessages.length) return;

  // On cible uniquement la partie markdown, qui contient le texte "propre"
  const lastBotMessage = botMessages[botMessages.length - 1];
  const markdownDiv = lastBotMessage.querySelector(".markdown");
  if (!markdownDiv) return;

  const prompt = markdownDiv.textContent.trim();

  appendMessage(prompt, "user");
  appendMessage("Réponse en cours…", "bot");

  if (linkElement?.parentElement) linkElement.parentElement.remove();

  fetch(`${backendURL}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, uid: currentUID, conversationId: currentConversationId })
  })
  .then(res => res.json())
  .then(data => {
    updateLastBotMessage(data.response || "Erreur IA.");
    scrollToBottom();
  })
  .catch(() => updateLastBotMessage("Erreur réseau."));
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

  document.getElementById("exitArchiveBtn").style.display = "none";

  (data.conversations || []).forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="conversation-preview" onclick="loadConversation('${c.id}')">${c.preview.slice(0, 40)}...</span>
      <div class="dropdown-container">
        <i class="fa-solid fa-ellipsis-vertical options-icon"></i>
        <div class="dropdown-menu">
          <div onclick="toggleArchive(event, '${c.id}', ${!c.archived})">${c.archived ? "Désarchiver" : "Archiver"}</div>
          <div onclick="confirmDelete(event, '${c.id}')">Supprimer</div>
        </div>
      </div>
    `;
    li.classList.add("conversation-item");
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

    console.log("📦 Messages reçus :", data.messages);

    const container = document.getElementById("chatContainer");
    if (!container) {
      console.error("⛔ Élément #chatContainer introuvable dans le DOM !");
      return;
    }
    container.innerHTML = "";

    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = "<p style='color: #94a3b8; font-style: italic;'>Aucun message dans cette conversation.</p>";
      return;


    }

    // Exclure les messages système temporaires
    const tempMessages = [
      "Optimisation du prompt en cours…",
      "Réponse en cours…",
      "Erreur réseau ou délai dépassé.",
      "Erreur IA."
    ];

    data.messages.forEach(m => {
      if (tempMessages.includes(m.text)) return;
      appendMessage(m.text, m.role);
      if (m.role === "bot") {
        const last = document.querySelectorAll(".chat-message.bot");
        const lastMsg = last[last.length - 1];

        lastMsg.innerHTML = `
           <div class="markdown">${marked.parse(m.text)}</div>
           <div class="chat-actions">
              <a href="#" onclick="copyMessage(this)">
                 <i class="fa-regular fa-copy"></i> Copier
              </a>;
           </div>
  `      ;
       }

    });

    scrollToBottom();
    updateChatLayout();
  } catch (err) {
    console.error("Erreur chargement conversation :", err);
  }
}


async function startNewConversation(force = false) {
  if (!force && isCurrentConversationEmpty()) {
    console.log("Conversation vide — aucune nouvelle discussion créée.");
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
    console.error("Erreur nouvelle conversation :", err);
  }
}


function toggleHistory() {
  const sidebar = document.getElementById("sidebar");
  const reopenBtn = document.getElementById("reopenHistoryBtn");
  const mainContent = document.querySelector(".main-content");

  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
    reopenBtn.style.display = "none";
    mainContent.style.marginLeft = "260px";
  } else {
    sidebar.style.display = "none";
    reopenBtn.style.display = "block";
    mainContent.style.marginLeft = "0";
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

function confirmDelete(e, id) {
  e.stopPropagation();
  if (confirm("Es-tu sûr de vouloir supprimer cette conversation ?")) {
    fetch(`${backendURL}/conversation/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) loadConversationHistory();
      });
  }
}

function toggleArchive(e, id, archive) {
  e.stopPropagation();
  console.log("toggleArchive called", id, archive); // ✅ ici, en dehors de fetch()

  fetch(`${backendURL}/conversation/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, archive })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) loadConversationHistory();
    });
}


function showArchived() {
  fetch(`${backendURL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: currentUID })
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("conversationList");
    document.getElementById("exitArchiveBtn").style.display = "block";

    list.innerHTML = "";

    (data.conversations || []).forEach(c => {
      if (!c.archived) return;

      const li = document.createElement("li");
      li.innerHTML = `
        <span class="conversation-preview" onclick="loadConversation('${c.id}')">${c.preview.slice(0, 40)}...</span>
        <span class="conversation-actions">
          <i class="fa-solid fa-box-archive archived" title="Désarchiver" onclick="toggleArchive(event, '${c.id}', false)"></i>
          <i class="fa-solid fa-trash" title="Supprimer" onclick="confirmDelete(event, '${c.id}')"></i>
        </span>
      `;
      li.classList.add("conversation-item");
      list.appendChild(li);
    });
  });
}

function toggleLang() {
  const translations = {  
    
  "Se connecter": "Log in",
  "S’inscrire": "Sign up",
  "Mot de passe": "Password",
  "Mot de passe oublié ?": "Forgot password?",
  "Vous n’avez pas de compte ?": "Don't have an account?",
  "Vous avez déjà un compte ?": "Already have an account?",
  "Confirmez le mot de passe": "Confirm password",
  "Réinitialiser le mot de passe": "Reset password",
  "Votre email": "Your email",
  "Envoyer le lien de réinitialisation": "Send reset link",
  "🔙 Retour": "🔙 Back",
  "Inscription réussie.": "Registration successful.",
  "Mots de passe différents.": "Passwords do not match.",
  "Email envoyé.": "Email sent.",
  "Copié !": "Copied!",

  // Interface principale
  "Nouvelle discussion": "New conversation",
  "Discussions archivées": "Archived conversations",
  "Type your request here…": "Écris ta demande ici…", // sens inverse
  "Écris ta demande ici…": "Type your request here…",
  "Envoyer": "Send",

  // Chat messages
  "Optimisation du prompt en cours…": "Optimizing prompt…",
  "Réponse en cours…": "Generating response…",
  "Erreur réseau ou délai dépassé.": "Network error or timeout.",
  "Erreur IA.": "AI error.",
  "Erreur réseau.": "Network error.",
  "Aucun message dans cette conversation.": "No messages in this conversation.",
  "⚠️ Tu n’as encore rien écrit dans cette conversation.": "⚠️ You haven't written anything in this conversation yet.",
  "Conversation vide — aucune nouvelle discussion créée.": "Empty conversation — no new chat created.",

  // Actions
  "Envoyer à l'IA": "Send to AI",
  "Copier": "Copy",
  "Copier la réponse": "Copy response",
  "Es-tu sûr de vouloir supprimer cette conversation ?": "Are you sure you want to delete this conversation ?",

  // Compte
  "Mon compte": "My account",
  "Confidentialité": "Privacy",
  "Sécurité": "Security",
  "Se déconnecter": "Log out"
  };

  const reverse = Object.fromEntries(Object.entries(translations).map(([k, v]) => [v, k]));
  const all = { ...translations, ...reverse };

  document.querySelectorAll("button, input, a, span, h2, h1, label").forEach(el => {
    if (el.placeholder && all[el.placeholder]) {
      el.placeholder = all[el.placeholder];
    }
    if (el.textContent && all[el.textContent.trim()]) {
      el.textContent = all[el.textContent.trim()];
    }
  });
}
window.addEventListener("DOMContentLoaded", () => {
  // Dropdown des 3 points
  document.querySelectorAll(".dropdown-container").forEach(container => {
    const icon = container.querySelector(".options-icon");
    const menu = container.querySelector(".dropdown-menu");

    let timeoutId;

    icon.addEventListener("click", (e) => {
      e.stopPropagation(); // empêche la fermeture globale
      clearTimeout(timeoutId);
      const wasVisible = menu.style.display === "block";
      document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
      menu.style.display = wasVisible ? "none" : "block";
    });

    container.addEventListener("mouseleave", () => {
      timeoutId = setTimeout(() => {
        menu.style.display = "none";
      }, 1500);
    });

    container.addEventListener("mouseenter", () => {
      clearTimeout(timeoutId);
    });
  });

  // Fermer les menus si on clique ailleurs
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
      
      if (logout) {
        logout.addEventListener("click", () => {
           signOut();
        });
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const menus = document.querySelectorAll(".dropdown-container");

  menus.forEach(menu => {
    let timeout;

    const dropdown = menu.querySelector(".dropdown-menu");

    menu.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
      dropdown.style.display = "block";
    });

    menu.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        if (!dropdown.matches(':hover')) {
          dropdown.style.display = "none";
        }
      }, 1500);
    });

    dropdown.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
    });

    dropdown.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        dropdown.style.display = "none";
      }, 1500);
    });
  });
});
