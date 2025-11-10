const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api'
};

class API {
    constructor() { this.baseURL = API_CONFIG.BASE_URL; }
}

window.DigitalTwinAPI = new API();
console.log('✓ api-config.js loaded');
