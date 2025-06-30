body {
  background: #0f172a;
  color: #f8fafc;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 2rem;
}

/* TITRE PRINCIPAL */
h1 {
  font-family: 'Orbitron', sans-serif;
  text-align: center;
  color: #38bdf8;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
}

/* SECTION AUTH */
#authSection {
  max-width: 360px;
  margin: 3rem auto;
  padding: 2rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  text-align: center;
}

#authSection input {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #f8fafc;
  font-size: 1rem;
}

#authSection button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

#authSection button:hover {
  transform: scale(1.03);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
}

#authSection .forgot-password {
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #38bdf8;
  text-decoration: none;
}

#authSection .forgot-password:hover {
  text-decoration: underline;
}

#authSection .signup-footer {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #cbd5e1;
}

#authSection .signup-footer a {
  color: #38bdf8;
  text-decoration: none;
  margin-left: 5px;
}

#authSection .signup-footer a:hover {
  text-decoration: underline;
}

#authStatus {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #facc15;
}

/* ZONE DE TEXTE */
textarea {
  width: 100%;
  height: 140px;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #334155;
  border-radius: 10px;
  resize: vertical;
  font-size: 1rem;
  background: #1e293b;
  color: #f8fafc;
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}

/* BOUTONS CENTRÉS */
.buttons {
  text-align: center;
  margin-bottom: 1rem;
}

/* BOUTONS GÉNÉRAUX */
button {
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  margin: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
}

/* RÉSULTATS IA */
.output {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #38bdf8;
  font-size: 1.1rem;
}

/* ACTION BUTTONS */
.action-buttons {
  text-align: right;
  margin-top: 1rem;
}

.action-buttons button {
  background: linear-gradient(to right, #10b981, #22c55e);
  border: none;
  color: #f0fdf4;
}

.action-buttons button:hover {
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

/* MESSAGE DE CHARGEMENT */
.loading-message {
  text-align: center;
  margin-top: 1rem;
  font-style: italic;
  color: #94a3b8;
  font-size: 1rem;
}

/* COLONNES DE RÉPONSE */
.response-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  margin-top: 2rem;
}

.response-column {
  flex: 1 1 45%;
  min-width: 300px;
}

/* STYLE DU TEXTE IA */
#aiResponse h1, #aiResponse h2, #aiResponse h3 {
  color: #38bdf8;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-family: 'Orbitron', sans-serif;
}

#aiResponse p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

#aiResponse ul,
#aiResponse ol {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: #f8fafc;
}

#aiResponse li {
  margin-bottom: 0.3rem;
}

#aiResponse li::marker {
  color: #22d3ee;
}

#aiResponse code {
  background-color: #0f172a;
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  color: #38bdf8;
}

#aiResponse pre {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  overflow-x: auto;
  margin-top: 1rem;
}

/* STYLE DU TEXTE OPTIMISÉ */
#optimizedPrompt h1,
#optimizedPrompt h2,
#optimizedPrompt h3 {
  color: #38bdf8;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-family: 'Orbitron', sans-serif;
}

#optimizedPrompt p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

#optimizedPrompt ul,
#optimizedPrompt ol {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: #f8fafc;
}

#optimizedPrompt li {
  margin-bottom: 0.3rem;
}

#optimizedPrompt code {
  background-color: #0f172a;
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  color: #38bdf8;
}

#optimizedPrompt pre {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  overflow-x: auto;
  margin-top: 1rem;
}
