const { TranslatorTextClient } = require('@azure/cognitiveservices-translatortext');
const { CognitiveServicesCredentials } = require('@azure/ms-rest-azure');

const credentials = new CognitiveServicesCredentials(process.env.TRANSLATOR_API_KEY);
const client = new TranslatorTextClient(credentials, process.env.TRANSLATOR_API_ENDPOINT);

module.exports = {
  translateText: async function(text) {
    const translatedText = await client.translate([text], 'en', 'es');
    return translatedText;
  }
};
