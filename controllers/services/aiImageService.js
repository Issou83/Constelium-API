// services/aiImageService.js
const axios = require("axios");

async function generateWeb3Image(title) {
  // Prompt minimal
  const prompt = `A realistic, detailed futuristic illustration about ${title}, 
                  related to Web3 and blockchain, trending on artstation.`;

  try {
    const HF_TOKEN = process.env.HF_TOKEN;
    const HF_MODEL_URL = process.env.HF_MODEL_URL;
    // ex: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"

    const response = await axios.post(
      HF_MODEL_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Convertir l'image binaire en base64
    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;
    return dataUrl;
  } catch (error) {
    console.error("Erreur génération image (Hugging Face):", error);
    // En cas d'erreur, retourner une image par défaut ?
    return "";
  }
}

module.exports = { generateWeb3Image };
