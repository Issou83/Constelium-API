require("dotenv").config();
const { Mistral } = require("@mistralai/mistralai");

// Initialisation du client Mistral
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY, // Vérifie bien que la clé API est bien définie
});

async function generateArticleFromSources(sources) {
  // 🔹 Construction du texte à partir des sources RSS
  const combinedText = sources
    .map(
      (s, i) =>
        `Source ${i + 1}:\nTitre: ${s.title}\nExtrait: ${s.contentSnippet}\n`
    )
    .join("\n");

  // 🔹 Prompt optimisé pour Mistral AI avec un format strict
  const prompt = `
    Tu es un rédacteur expérimenté en Web3. 
    Je vais te donner plusieurs extraits d'articles récents sur un sujet similaire.

    ➜ Ton objectif :
      - Vérifier s'il y a des contradictions ou des informations douteuses. 
        🔹 Si oui, écris UNIQUEMENT "DOUTE" et ne continue pas.
      - Sinon, rédige un article clair et structuré d’environ 300 mots en bon français.

    ➜ Format strict à respecter :
      TITRE: [Le titre accrocheur de l'article]
      TEXTE:
      [Le contenu structuré de l'article, en plusieurs paragraphes]

    Voici les extraits d'articles récents :
    ${combinedText}

    🔹 Si tu détectes des incohérences, écris "DOUTE" immédiatement sans répondre autre chose.
    🔹 Sinon, rédige un article original selon le format demandé.
  `;

  try {
    // 🔹 Appel Mistral AI avec le bon modèle
    const response = await mistral.chat.complete({
      model: "mistral-small-latest", // Utilise un modèle adapté
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.7,
    });

    if (!response || !response.choices || !response.choices.length) {
      throw new Error("Réponse invalide de Mistral AI");
    }

    // 🔹 Extraction du texte généré
    const rawOutput = response.choices[0].message.content.trim();

    if (rawOutput.includes("DOUTE")) {
      return { title: "", text: "", isDoubtful: true };
    }

    // 🔹 Parsing du format "TITRE: ...\nTEXTE: ..."
    const lines = rawOutput.split("\n").map((l) => l.trim());
    let title = "";
    let text = "";
    let readingText = false;

    for (const line of lines) {
      if (line.toUpperCase().startsWith("TITRE:")) {
        title = line.replace(/TITRE:\s*/i, "").trim();
        readingText = false;
      } else if (line.toUpperCase().startsWith("TEXTE:")) {
        text = line.replace(/TEXTE:\s*/i, "").trim();
        readingText = true;
      } else if (readingText) {
        text += "\n" + line;
      }
    }

    // 🔹 Vérification finale de la sortie
    if (!title || !text) {
      console.warn("⚠️ Format de sortie incorrect, retour en fallback.");
      return { title: "Article Web3", text: rawOutput, isDoubtful: false };
    }

    return { title, text, isDoubtful: false };
  } catch (error) {
    console.error("❌ Erreur Mistral:", error);
    return { title: "", text: "", isDoubtful: true };
  }
}

module.exports = { generateArticleFromSources };
