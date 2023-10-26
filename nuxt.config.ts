// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
      appwriteDb: process.env.APPWRITE_DB,
      appwriteVocabularyCollection: process.env.APPWRITE_VOCABULARY_COLLECTION
    }
  },
  ssr: false
})
