// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBzEFTyOLMinVglWBmGSVqCwCtUfg40-l8",
  authDomain: "prompt-app-82523.firebaseapp.com",
  projectId: "prompt-app-82523",
  storageBucket: "prompt-app-82523.firebasestorage.app",
  messagingSenderId: "573537645411",
  appId: "1:573537645411:web:da0782831b6358db319956"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const backendURL = "https://prompt-ai-naa1.onrender.com";

// Copie de texte
function copyText(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Texte copié !");
  });
}

// Génération du prompt
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
    console.log("Prompt généré :", data);

    document.getElementById("optimizedPrompt").textContent = data.response || "Erreur dans la génération.";
    document.getElementById("generatedPromptBox").style.display = "block";
  } catch (error) {
    console.error("Erreur dans generatePrompt:", error);
    alert("Erreur lors de la génération du prompt.");
  }
}

// Réponse de l'IA
async function getAIResponse() {
  const improvedPrompt = document.getElementById("optimizedPrompt").textContent.trim();
  if (!improvedPrompt) {
    alert("Aucun prompt optimisé trouvé.");
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
    console.log("Réponse IA :", data);

    document.getElementById("aiResponse").innerHTML = marked.parse(data.response || "Erreur dans la réponse.");
    document.getElementById("aiResponseBox").style.display = "block";
  } catch (error) {
    console.error("Erreur dans getAIResponse:", error);
    alert("Erreur lors de la réponse de l'IA.");
  }
}

// Authentification Firebase
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Veuillez remplir tous les champs.");
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

function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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

function signOut() {
  auth.signOut()
    .then(() => {
      document.getElementById("authStatus").textContent = "👋 Déconnecté.";
    });
}

// Changement d'état utilisateur
auth.onAuthStateChanged(user => {
  const authSection = document.getElementById("authSection");
  const appSection = document.getElementById("appSection");

  if (user) {
    console.log("Connecté :", user.email);
    authSection.style.display = "none";
    appSection.style.display = "block";
  } else {
    console.log("Utilisateur non connecté");
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});
