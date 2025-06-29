async function generatePrompt() {
  const prompt = document.getElementById("userPrompt").value;
  const output = document.getElementById("output");

  if (!prompt.trim()) {
    output.textContent = "Merci d'écrire un prompt.";
    return;
  }

  output.textContent = "Génération en cours...";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    output.textContent = data.response || "Erreur dans la réponse.";
  } catch (err) {
    output.textContent = "Erreur de connexion.";
  }
}
