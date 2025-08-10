const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV or DEPLOYMENT_MODE
function loadEnvironment() {
    const env = process.env.NODE_ENV || 'development';
    const deploymentMode = process.env.DEPLOYMENT_MODE || 'local';
    
    // Try to load environment-specific .env file
    if (deploymentMode === 'production') {
        // Load production environment
        dotenv.config({ path: path.resolve(__dirname, '../../../.env.production') });
    } else if (deploymentMode === 'local' || env === 'development') {
        // Load local development environment
        dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
    }
    
    // Load default .env as fallback
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
    
    // Validate required environment variables
    const required = [
        'DATABASE_URL',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    }
    
    return {
        // Server Configuration
        NODE_ENV: process.env.NODE_ENV || 'development',
        DEPLOYMENT_MODE: process.env.DEPLOYMENT_MODE || 'local',
        PORT: parseInt(process.env.PORT || process.env.API_PORT || '3000'),
        
        // Database
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432'),
        DATABASE_USER: process.env.DATABASE_USER,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_NAME: process.env.DATABASE_NAME || 'nvidia',
        
        // JWT
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'yourverysecretkey',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'yourrefreshsecretkey',
        
        // Docker Configuration
        DOCKER_HOST: process.env.DOCKER_HOST || 'unix:///var/run/docker.sock',
        DOCKER_DNS_PRIMARY: process.env.DOCKER_DNS_PRIMARY || '8.8.8.8',
        DOCKER_DNS_SECONDARY: process.env.DOCKER_DNS_SECONDARY || '8.8.4.4',
        DOCKER_DNS_SERVERS: process.env.DOCKER_DNS_SERVERS || '8.8.8.8,8.8.4.4',
        
        // CORS
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001',
        
        // GPU
        NVIDIA_VISIBLE_DEVICES: process.env.NVIDIA_VISIBLE_DEVICES || 'all',
        NVIDIA_DRIVER_CAPABILITIES: process.env.NVIDIA_DRIVER_CAPABILITIES || 'utility,compute',
        
        // Ports
        SSH_PORT_START: parseInt(process.env.SSH_PORT_START || '20000'),
        SSH_PORT_END: parseInt(process.env.SSH_PORT_END || '21000'),
        JUPYTER_PORT_START: parseInt(process.env.JUPYTER_PORT_START || '20000'),
        JUPYTER_PORT_END: parseInt(process.env.JUPYTER_PORT_END || '21000'),
        
        // Network
        DOCKER_NETWORK_NAME: process.env.DOCKER_NETWORK_NAME || 'postgres-network',
        
        // Logging
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        LOG_FORMAT: process.env.LOG_FORMAT || 'dev',
        
        // API URLs
        API_HOST: process.env.API_HOST || 'localhost',
        FRONTEND_URL: process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3001',
        
        // Helper functions
        isProduction: () => process.env.NODE_ENV === 'production' || process.env.DEPLOYMENT_MODE === 'production',
        isDevelopment: () => process.env.NODE_ENV === 'development' || process.env.DEPLOYMENT_MODE === 'local',
        isLocal: () => process.env.DEPLOYMENT_MODE === 'local' || (!process.env.DEPLOYMENT_MODE && process.env.NODE_ENV !== 'production')
    };
}

// Load and export configuration
const config = loadEnvironment();

module.exports = config;
