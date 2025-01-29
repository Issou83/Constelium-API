const axios = require("axios");

async function generateArticleFromSources(sources) {
  // Création du prompt basé sur les articles récupérés
  const combinedText = sources.map((s, i) => {
    return `Source ${i + 1}:\nTitre: ${s.title}\nExtrait: ${s.contentSnippet}\n`;
  }).join("\n");

  const prompt = `
    Tu es un rédacteur spécialisé en Web3.
    Je te fournis plusieurs extraits d'articles sur un thème similaire.
    - Vérifie s'il existe des infos douteuses ou contradictoires.
    - Si oui, écris "DOUTE".
    - Sinon, rédige un article bien structuré de 300 mots minimum en bon français,
      avec un TITRE accrocheur et le TEXTE.
      
    Extraits :
    ${combinedText}
  `;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        inputs: prompt,
        parameters: {
          max_length: 1200,
          temperature: 0.7
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const rawOutput = response.data[0].generated_text.trim();

    if (rawOutput.includes("DOUTE")) {
      return { title: "", text: "", isDoubtful: true };
    }

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
    console.error("Erreur IA (Hugging Face Llama 2) :", error);
    return { title: "", text: "", isDoubtful: true };
  }
}

module.exports = { generateArticleFromSources };
