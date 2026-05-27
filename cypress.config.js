const {
    networkShim,
    chromeAllowXSiteCookies,
    cucumberPreprocessor,
} = require('@dhis2/cypress-plugins')
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    projectId: '3wojdo',
    video: false,
    e2e: {
        experimentalInteractiveRunEvents: true,
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.feature',
        async setupNodeEvents(on, config) {
            await cucumberPreprocessor(on, config)
            networkShim(on, config)
            chromeAllowXSiteCookies(on, config)

            return config
        },
        env: {
            dhis2DataTestPrefix: 'dhis2-approval',
            networkMode: 'live',
            dhis2ApiVersion: '44',
        },
    },
})
