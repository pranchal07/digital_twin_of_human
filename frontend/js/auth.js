class AuthHandler {
    constructor() {
        console.log('✓ AuthHandler initialized');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Login page ready');
    new AuthHandler();
});
console.log('✓ auth.js loaded');
