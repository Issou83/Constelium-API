// services/aiService.js
const axios = require("axios");

async function generateArticleFromSources(sources) {
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
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    const rawOutput = response.data.choices[0]?.message?.content?.trim() || "";

    if (rawOutput.includes("DOUTE")) {
      return { title: "", text: "", isDoubtful: true };
    }

    // Parsing reste identique
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
      title = "Article Web3";
      text = rawOutput;
    }

    return { title, text, isDoubtful: false };
  } catch (error) {
    console.error("Erreur Deepseek:", error.response?.data || error.message);
    return { title: "", text: "", isDoubtful: true };
  }
}

module.exports = { generateArticleFromSources };
