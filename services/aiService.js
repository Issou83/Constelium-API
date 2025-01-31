const OpenAI = require("openai");

// On initialise OpenAI avec la bonne méthode
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vérifie que ta clé API est bien définie
});

async function generateArticleFromSources(sources) {
  try {
    console.log("Appel API OpenAI en cours...");

    // Prompt
    const prompt = `
  Tu es un rédacteur spécialisé en Web3.
  Je te fournis plusieurs extraits d'articles sur un thème similaire.
  Tu dois rédiger un article d'environ 300 mots en bon français,
    avec un TITRE accrocheur (sur une ligne) et le TEXTE (sur les lignes suivantes).
  
  Extraits :
  ${combinedText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Essaye avec "gpt-4" ou "gpt-3.5-turbo"
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.7,
    });

    if (!response || !response.choices || !response.choices.length) {
      throw new Error("Réponse invalide d'OpenAI");
    }

    const article = response.choices[0].message.content.trim();
    const lines = article.split("\n");

    return {
      title: lines[0], // Titre en première ligne
      text: lines.slice(1).join("\n"), // Texte en dessous
      isDoubtful: article.includes("DOUTE"),
    };
  } catch (error) {
    console.error("Erreur OpenAI:", error);
    return null;
  }
}

module.exports = { generateArticleFromSources };
