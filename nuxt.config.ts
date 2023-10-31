// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    head: {
      link: [{ rel: "stylesheet", href: "https://www.w3schools.com/w3css/4/w3.css" }],
      script: [{ src: "https://kit.fontawesome.com/ea227ca389.js", crossorigin: "anonymous" }]
    }
  },
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProject: process.env.APPWRITE_PROJECT,
      appwriteSpeechAnalyzerApiKey: process.env.APPWRITE_SPEECH_ANALYZER_API_KEY,
      appwriteDb: process.env.APPWRITE_DB,
      appwriteVocabularyCollection: process.env.APPWRITE_VOCABULARY_COLLECTION,
      appwriteSpeechAnalyzerBucket: process.env.APPWRITE_SPEECH_ANALYZER_BUCKET,
      speechAceEndpoint: process.env.SPEECH_ACE_ENDPOINT,
      speechAceKey: process.env.SPEECH_ACE_KEY,
    }
  }
})
