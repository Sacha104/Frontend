const firebaseConfig = { 
  apiKey: "AIzaSyBgAH1F9Pl6BsWgXblPU1m1kjnvDiCHGX0",
  authDomain: "prompt-app-36051.firebaseapp.com",
  projectId: "prompt-app-36051",
  storageBucket: "prompt-app-36051.firebasestorage.app",
  messagingSenderId: "941533435551",
  appId: "1:941533435551:web:4712d066912cbeb2b774aa",
  measurementId: "G-GDDT6YXN5J"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const backendURL = "https://prompt-ai-naa1.onrender.com";

let currentUID = null;
let currentConversationId = null;
const providerGoogle = new firebase.auth.GoogleAuthProvider();
const providerApple = new firebase.auth.OAuthProvider('apple.com');

// Fonction pour charger les données de l'utilisateur une fois connecté
function loadUserData(user) {
  console.log("Données utilisateur:", user);
  // Vous pouvez maintenant effectuer des actions comme charger des conversations, etc.
  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "flex";
}

// Fonction pour charger la dernière conversation
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

    // Charger l'historique et la dernière conversation automatiquement
    loadConversationHistory();
    loadLastConversation();

  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    if (wrapper) wrapper.style.display = "flex";
    if (icon) icon.style.display = "none";
  }
});


// Fonction pour afficher l'inscription
function showSignUp() {
  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");
  const loginFooter = document.getElementById("loginFooter");
  const signupFooter = document.getElementById("signupFooter");

  if (loginSection && signupSection) {
    loginSection.style.display = "none";
    signupSection.style.display = "block";
    loginFooter.style.display = "none";
    signupFooter.style.display = "block";
  }
}

function showLogin() {
  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");
  const loginFooter = document.getElementById("loginFooter");
  const signupFooter = document.getElementById("signupFooter");

  if (loginSection && signupSection) {
    loginSection.style.display = "block";
    signupSection.style.display = "none";
    loginFooter.style.display = "block";
    signupFooter.style.display = "none";
  }
}

// Fonction de connexion
function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "flex";
    })
    .catch(e => document.getElementById("authStatus").textContent = e.message);
}

// Fonction d'inscription
function signUp() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
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

// Fonction de réinitialisation du mot de passe
function showReset() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("signupSection").style.display = "none";
  document.getElementById("resetSection").style.display = "block";
}

// Fonction pour la connexion avec Google
function googleSignIn() {
  firebase.auth().signInWithPopup(providerGoogle)
    .then((result) => {
      console.log(result.user);
      // Actions après connexion réussie
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "flex";
    })
    .catch((error) => {
      console.error(error);
    });
}


// Fonction pour afficher ou masquer les mots de passe
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  input.type = input.type === "password" ? "text" : "password";
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}

// Fonction pour envoyer un email de réinitialisation du mot de passe
function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value;
  auth.sendPasswordResetEmail(email)
    .then(() => document.getElementById("resetStatus").textContent = "Email envoyé.")
    .catch(e => document.getElementById("resetStatus").textContent = e.message);
}

// Fonction pour se déconnecter
function signOut() {
  auth.signOut().then(() => {
    currentUID = null;
    currentConversationId = null;
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    forceScrollToTop();
  });
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
  let endpoint = "/generate"; // par défaut OpenAI texte
  
  appendMessage("Optimisation du prompt en cours…", "bot");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70000); // ⏱️ 30 sec timeout

  try {
    const res = await fetch(`${backendURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: message, 
        uid: currentUID, 
        conversationId: currentConversationId 
      })
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




// (Modifications dans la fonction qui ajoute le message du bot)
function updateLastBotMessage(text, mode = "text") {
  const messages = document.querySelectorAll(".chat-message.bot");
  if (messages.length === 0) return;

  const lastBotMsg = messages[messages.length - 1];
  lastBotMsg.innerHTML = ""; // on vide

  // === Cas IMAGE ===
  if (mode === "image") {
    lastBotMsg.innerHTML = `
      <img src="${text}" alt="Image générée" style="max-width:100%; border-radius:10px;">
      <div class="chat-actions">
        <a href="${text}" download="image.png">
          <i class="fa-solid fa-download"></i> Télécharger
        </a>
      </div>
    `;
    return; // on sort, pas d’animation texte
  }

  // === Cas VIDEO ===
  if (mode === "video") {
    lastBotMsg.innerHTML = `
      <video controls style="max-width:100%; border-radius:10px;">
        <source src="${text}" type="video/mp4">
        Ton navigateur ne supporte pas la vidéo.
      </video>
      <div class="chat-actions">
        <a href="${text}" download="video.mp4">
          <i class="fa-solid fa-download"></i> Télécharger
        </a>
      </div>
    `;
    return;
  }

  // === Cas TEXTE (déjà existant, avec animation progressive) ===
  const plainText = text.trim();
  const typingDiv = document.createElement("div");
  typingDiv.className = "markdown";
  typingDiv.id = "typingArea";
  lastBotMsg.appendChild(typingDiv);

  let index = 0;

  function typeNextChar() {
    if (index < plainText.length) {
      typingDiv.textContent += plainText.charAt(index);
      index++;
      setTimeout(typeNextChar, 12);
    } else {
      typingDiv.innerHTML = marked.parse(plainText);
      const chatContainer = document.getElementById("chatContainer");
      const actionRow = document.createElement("div");
      actionRow.className = "chat-actions";
      actionRow.innerHTML = `
       <label for="outputChoice">Choisir le format :</label>
       <select id="outputChoice">
          <option value="text">Texte</option>
          <option value="image">Image</option>
          <option value="video">Vidéo</option>
        </select>
        <button onclick="sendOptimizedPrompt()">Envoyer à l'IA</button>
      `;
      chatContainer.appendChild(actionRow);
      scrollToBottom();
    }
  }

  typeNextChar();
}

async function sendOptimizedPrompt() {
  const token = await firebase.auth().currentUser?.getIdToken();  // Récupère le token Firebase de l'utilisateur
  if (!token) {
    console.error("Erreur : token Firebase introuvable");
    updateLastBotMessage("Erreur : utilisateur non authentifié.");
    return;
  }

  const choiceEl = document.getElementById("outputChoice");
  const choice = choiceEl ? choiceEl.value : "text";

  const botMessages = document.querySelectorAll(".chat-message.bot");
  if (!botMessages.length) return;

  const lastBotMessage = botMessages[botMessages.length - 1];
  const markdownDiv = lastBotMessage.querySelector(".markdown");
  if (!markdownDiv) return;
  const prompt = markdownDiv.textContent.trim();

  if (!prompt) {
    console.error("Erreur : prompt vide");
    return;
  }

  if (choice === "text" && (!currentUID || !currentConversationId)) {
    console.error("Erreur : UID ou conversation manquants pour le texte", { prompt, currentUID, currentConversationId });
    return;
  }

  appendMessage("Génération en cours…", "bot");

  // Construire le payload pour chaque type de requête
  let payload = { prompt };
  if (choice === "text") {
    payload.uid = currentUID;
    payload.conversationId = currentConversationId;
  } else if (choice === "image" || choice === "video") {
    payload = {
      prompt,
      uid: currentUID,
      conversationId: currentConversationId,
    };
  }

  // Afficher le payload envoyé avant d'envoyer la requête
  console.log("Payload envoyé à l'API : ", payload);

  // Déterminer l'endpoint en fonction du choix (texte, image ou vidéo)
  let endpoint = "/respond"; // Texte par défaut
  if (choice === "image") endpoint = "/generate_image"; // Changer pour génération d'image
  if (choice === "video") endpoint = "/generate_video"; // Changer ici pour génération de vidéo

  try {
    const res = await fetch(`${backendURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Utilise toujours le token Firebase ici
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {  // Vérifie si la requête a réussi
      const errorData = await res.json(); // récupère le message d'erreur détaillé
      console.error(`Erreur HTTP : ${res.status} - ${res.statusText}`, errorData);
      updateLastBotMessage(`Erreur : ${errorData.error || 'Problème avec l\'API'}`);
      return;
    }

    const data = await res.json();
    const response = data.response || "Erreur IA.";

    // Vérification si c'est bien une URL pour image/vidéo
    if ((choice === "image" || choice === "video") && !/^https?:\/\//.test(response)) {
      console.error("Erreur : réponse invalide pour image/vidéo");
      updateLastBotMessage("Erreur IA. (réponse invalide)");
      return;
    }

    // Afficher selon le choix
    if (choice === "image") {
      updateLastBotMessage(response, "image");
    } else if (choice === "video") {
      updateLastBotMessage(response, "video");  // Afficher la vidéo
    } else {
      updateLastBotMessage(response, "text");
    }
  } catch (e) {
    console.error("Erreur réseau :", e);
    updateLastBotMessage("Erreur réseau.");
  }
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
    container.innerHTML = ""; // Clear previous messages

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

      // Afficher chaque message
      appendMessage(m.text, m.role); // Affiche chaque message

      // Si le message contient une image (image_url est défini)
      if (m.image_url) {
        const last = document.querySelectorAll(".chat-message.bot");
        const lastMsg = last[last.length - 1];
        lastMsg.innerHTML = `
          <img src="${m.image_url}" alt="Image générée" style="max-width:100%; border-radius:10px;">
          <div class="chat-actions">
            <a href="${m.image_url}" download="image.png">
              <i class="fa-solid fa-download"></i> Télécharger
            </a>
          </div>
        `;
      } else if (m.role === "bot") {
        const last = document.querySelectorAll(".chat-message.bot");
        const lastMsg = last[last.length - 1];

        lastMsg.innerHTML = `
           <div class="markdown">${marked.parse(m.text)}</div>
        `;
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

// Fonction pour basculer l'affichage de la sidebar sur mobile
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 600) {
    // Affiche ou cache la sidebar selon son état actuel
    sidebar.style.display = (sidebar.style.display === 'none' || sidebar.style.display === '') ? 'block' : 'none';
  }
}

// Ajoutez cet écouteur d'événements pour gérer la redimension de l'écran
window.addEventListener('resize', function() {
  if (window.innerWidth > 600) {
    // Affiche la sidebar par défaut sur les grands écrans
    document.getElementById("sidebar").style.display = 'block';
  } else {
    // Cache la sidebar sur mobile
    document.getElementById("sidebar").style.display = 'none';
  }
});

// Assurez-vous de basculer la sidebar si l'écran est redimensionné
document.addEventListener("DOMContentLoaded", () => {
  // Initialisez l'affichage de la sidebar
  if (window.innerWidth <= 600) {
    document.getElementById("sidebar").style.display = 'none';
  }
});

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
