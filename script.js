// 🔧 Firebase Config
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

// 📩 Affiche message dans chat
function addMessage(sender, text, isHTML = false) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = `message ${sender}-message`;
  msg.innerHTML = isHTML ? text : text.replace(/\n/g, "<br>");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔓 Authentification
function signIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "block";
      document.getElementById("chatBox").innerHTML = "";
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
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    document.getElementById("chatBox").innerHTML = "";
    document.getElementById("userPrompt").value = "";
  });
}

// 📋 Interface auth
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "none";
  document.getElementById("authStatus").textContent = "";
}

function showSignUp() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("resetSection").style.display = "none";
}

function showReset() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("resetSection").style.display = "block";
  document.getElementById("resetStatus").textContent = "";
}

// 🧠 Génération du prompt
async function generatePrompt() {
  const input = document.getElementById("userPrompt").value.trim();
  if (!input) return alert("✍️ Entre une demande.");

  addMessage("user", input);
  addMessage("system", "⏳ Génération du prompt…");

  try {
    const res = await fetch(`${backendURL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });
    const data = await res.json();
    const generated = data.response || "⚠️ Erreur.";
    addMessage("system", generated);
    document.getElementById("userPrompt").dataset.optimized = generated;
  } catch {
    addMessage("system", "⚠️ Erreur réseau.");
  }
}

// 🤖 Réponse IA
async function getAIResponse() {
  const improved = document.getElementById("userPrompt").dataset.optimized;
  if (!improved) return alert("📌 Génère d’abord un prompt.");

  addMessage("user", improved);
  addMessage("system", "🤖 Réponse en cours…");

  try {
    const res = await fetch(`${backendURL}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: improved })
    });
    const data = await res.json();
    addMessage("system", marked.parse(data.response || "⚠️ Erreur IA."), true);
  } catch {
    addMessage("system", "⚠️ Erreur réseau.");
  }
}

// 🔁 État utilisateur
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("chatBox").innerHTML = "";
    document.getElementById("userPrompt").focus({ preventScroll: true });
  }
});
