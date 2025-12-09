describe('AlterFocus Archetype System E2E', () => {
    beforeEach(() => {
        // Clear state
        cy.clearLocalStorage();
        cy.visit('/');
    });

    it('Complete User Flow: Onboarding -> Detection -> Dashboard', () => {
        // 1. Splash Screen
        cy.contains('AlterFocus').should('be.visible');

        // 2. Welcome Screen
        cy.contains('Bienvenido').click();

        // 3. Onboarding Flow
        // Step 1: Brain
        cy.contains('Entiende tu Cerebro').should('be.visible');
        cy.get('button').contains('Siguiente').click();

        // Step 2: Distractions (Select Instagram)
        cy.contains('Drenaje de Dopamina').should('be.visible');
        cy.contains('Instagram').click();
        cy.get('button').contains('Siguiente').click();

        // Step 3: Peak Hour (Morning)
        cy.contains('Cronotipo').should('be.visible');
        cy.contains('Mañana').click();
        cy.get('button').contains('Siguiente').click();

        // Step 4: Session (Pomodoro)
        cy.contains('Protocolo').should('be.visible');
        cy.contains('Pomodoro').click();
        cy.get('button').contains('Siguiente').click();

        // Step 5: Goal
        cy.get('input').type('Terminar mi tesis');
        cy.get('button').contains('Comenzar').click();

        // 4. Verify Dashboard & Detection
        cy.url().should('include', '/dashboard');
        cy.contains('Mis Patrones').should('be.visible');

        // Check local storage for detection
        cy.window().then((win) => {
            const stored = win.localStorage.getItem('alterfocus_current_archetype');
            expect(stored).to.exist;
            const data = JSON.parse(stored!);
            // Based on inputs (Instagram + Morning + Pomodoro), might detect specific archetype
            expect(data.primary).to.be.oneOf(['Fear', 'LowEnergy', 'Confusion', 'Chronic']);
        });
    });

    it('Intervention Flow: Trigger -> Execute -> Points', () => {
        // Bypass onboarding involved setting state directly
        const mockState = {
            onboardingComplete: true,
            userName: 'Test User'
        };
        cy.window().then((win) => {
            win.localStorage.setItem('alterfocus_app_state', JSON.stringify(mockState));
        });
        cy.reload();

        // Go to Intervention Selector manually (simulating distraction or button click)
        cy.contains('Intervención Inteligente').click();

        // Select "Ansiedad / Miedo"
        cy.contains('Ansiedad').click();

        // Verify Interventions List
        cy.contains('Versión Crappy').should('be.visible');

        // Start Intervention
        cy.contains('Versión Crappy').click();

        // Inside Intervention
        cy.contains('Versión CRAPPY').should('be.visible');
        cy.contains('Empezar').click();

        // Fast forward timer (simulated)
        cy.clock();
        cy.tick(120000); // 2 minutes

        // Verify Completion
        cy.contains('¡Lo hiciste!').should('be.visible');
        cy.contains('+20 puntos').should('be.visible');

        // Return to Dashboard
        cy.contains('Continuar').click();
        cy.contains('Mis Patrones').should('be.visible');
    });
});
