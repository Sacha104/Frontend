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
const backendURL = "https://prompt-ai-naa1.onrender.com";

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
  auth.signOut()
    .then(() => {
      document.getElementById("authSection").style.display = "block";
      document.getElementById("appSection").style.display = "none";
      forceScrollToTop();
    });
}

function togglePassword(inId, icoId) {
  const input = document.getElementById(inId);
  const icon = document.getElementById(icoId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
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
  document.getElementById("authStatus").textContent = "";
}

function showReset() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "block";
  document.getElementById("resetStatus").textContent = "";
}

function appendBubble(text, fromUser) {
  const container = document.getElementById('chatContainer');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ' + (fromUser ? 'right' : 'left');
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

async function generatePrompt() {
  const userPrompt = document.getElementById("userPrompt").value.trim();
  if (!userPrompt) return alert("🔍 Entre une idée ou demande.");

  appendBubble(userPrompt, true);
  // ...
  try {
    const data = await fetch(
    appendBubble(data.response || "⚠️ Erreur génération.", false);
  } catch {
    appendBubble("⚠️ Erreur réseau.", false);
  }
}

async function getAIResponse() {
  const improved = document.getElementById("optimizedPrompt").textContent.trim();
  if (!improved) return alert("📌 Génère d'abord un prompt.");

  appendBubble(improved, true);
  // ...
  try {
    const data = await fetch(...);
    appendBubble(marked.parse(data.response || "⚠️ Erreur IA."), false);
  } catch {
    appendBubble("⚠️ Erreur réseau.", false);
  }
}

function copyText(elId) {
  const text = document.getElementById(elId).textContent;
  navigator.clipboard.writeText(text).then(() => alert("✅ Copié !"));
}

