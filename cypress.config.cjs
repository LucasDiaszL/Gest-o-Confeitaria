const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://gest-o-confeitaria.vercel.app",
    setupNodeEvents(on, config) {
      // implemente node event listeners aqui se necessário
    },
    chromeWebSecurity: false, 
    video: false,
    screenshotOnRunFailure: false
  },
});