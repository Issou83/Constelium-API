// services/aiService.js
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Assure-toi de définir la variable d'env
});
const openai = new OpenAIApi(configuration);

async function generateArticleFromSources(sources) {
  // Simplification : on combine le titre + snippet de chaque source
  const combinedText = sources
    .map((s, i) => {
      return `Source ${i + 1}:\nTitre: ${s.title}\nExtrait: ${
        s.contentSnippet
      }\n`;
    })
    .join("\n");

  const prompt = `
    Tu es un rédacteur spécialisé en Web3.
    Je te fournis plusieurs extraits d'articles sur un thème similaire.
    - Vérifie s'il existe des infos douteuses ou contradictoires.
       Si oui, écris "DOUTE".
    - Sinon, rédige un article de 300 mots minimum, en bon français,
      avec un TITRE accrocheur (sur une ligne) et le TEXTE (sur les lignes suivantes).
    -L'article doit être informatif et original, sans plagiat.
    Extraits :
    ${combinedText}
  `;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1200,
      temperature: 0.7,
    });

    const rawOutput = response.data.choices[0].text?.trim() || "";

    if (rawOutput.includes("DOUTE")) {
      return { title: "", text: "", isDoubtful: true };
    }

    // Essai de parsing
    // On suppose qu'on a "TITRE: X\nTEXTE: Y..."
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

    // Si le format n'a pas été respecté, on met tout dans text
    if (!title && !text) {
      // fallback
      title = "Article Web3";
      text = rawOutput;
    }

    return { title, text, isDoubtful: false };
  } catch (error) {
    console.error("Erreur IA:", error);
    return { title: "", text: "", isDoubtful: true };
  }
}

module.exports = { generateArticleFromSources };
