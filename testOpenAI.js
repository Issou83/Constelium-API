// testOpenAI.js
require("dotenv").config(); // si tu as besoin de charger la clé depuis .env
const { Configuration, OpenAIApi } = require("openai");

console.log("openai version =", require("openai/package.json").version);

// Instanciation de la config
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

(async () => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Bonjour, test minimal OpenAI!",
      max_tokens: 5,
    });
    console.log("Réponse OpenAI :", response.data.choices[0].text);
  } catch (e) {
    console.error("Erreur OpenAI :", e);
  }
})();
