// services/aiService.js
const { OpenAI } = require("openai");

// Initialisation correcte du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Assurez-vous que la clé est bien définie dans Render
});

async function generateArticleFromSources(sources) {
  // On assemble le texte de chaque source
  const combinedText = sources
    .map((s, i) => {
      return `Source ${i + 1}:\nTitre: ${s.title}\nExtrait: ${
        s.contentSnippet
      }\n`;
    })
    .join("\n");

  // Prompt
  const prompt = `
    Tu es un rédacteur spécialisé en Web3.
    Je te fournis plusieurs extraits d'articles sur un thème similaire.
    - Vérifie s'il existe des infos douteuses ou contradictoires.
      Si oui, écris "DOUTE".
    - Sinon, rédige un article d'environ 300 mots en bon français,
      avec un TITRE accrocheur (sur une ligne) et le TEXTE (sur les lignes suivantes).
    
    Extraits :
    ${combinedText}
  `;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003", // ou "gpt-3.5-turbo" selon ton usage
      prompt,
      max_tokens: 1200,
      temperature: 0.7,
    });

    const rawOutput = response.data.choices[0].text?.trim() || "";

    if (rawOutput.includes("DOUTE")) {
      return { title: "", text: "", isDoubtful: true };
    }

    // Essai de parser "TITRE: ...\nTEXTE: ..."
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

    if (!title && !text) {
      // fallback si l'IA n'a pas respecté le format
      title = "Article Web3";
      text = rawOutput;
    }

    return { title, text, isDoubtful: false };
  } catch (error) {
    console.error("Erreur IA (OpenAI):", error);
    return { title: "", text: "", isDoubtful: true };
  }
}

module.exports = { generateArticleFromSources };
