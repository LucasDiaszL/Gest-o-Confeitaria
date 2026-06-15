const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://gest-o-confeitaria.vercel.app", // Garante a URL do seu deploy
    setupNodeEvents(on, config) {
      // implemente node event listeners aqui se necessário
    },
    // Proteção contra falhas de carregamento de recursos externos na esteira
    chromeWebSecurity: false, 
    video: false,
    screenshotOnRunFailure: false
  },
});