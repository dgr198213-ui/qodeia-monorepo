const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Configuración Automática de Howard OS\n');

// 1. Generar clave automáticamente
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('base64');
};

// 2. Crear archivo .env automáticamente
const setupEnvFile = (key) => {
  const envContent = `# Configuración Automática - Howard OS
VITE_ENCRYPTION_KEY=${key}
VITE_APP_MODE=local
VITE_AUTO_SAVE=true
VITE_DEFAULT_CREDENTIALS_PATH=./config/credentials.json
`;

  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado automáticamente');
  } else {
    console.log('⚠️  Archivo .env ya existe, conservando configuración');
  }

  return key;
};

// 3. Crear estructura de directorios
const createDirectoryStructure = () => {
  const dirs = [
    './config',
    './config/backups',
    './local-storage',
    './templates'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  console.log('✅ Estructura de directorios creada');
};

// 4. Crear credenciales por defecto
const createDefaultCredentials = () => {
  const credentialsPath = path.join(__dirname, '..', 'config', 'default-credentials.json');

  const defaultCredentials = {
    "github": {
      "token": "",
      "username": "",
      "notes": "Añade tu token personal de GitHub"
    },
    "openai": {
      "api_key": "",
      "organization": "",
      "notes": "Obten tu API key en platform.openai.com"
    },
    "vercel": {
      "token": "",
      "teamId": "",
      "notes": "Token de Vercel desde vercel.com/account/tokens"
    }
  };

  if (!fs.existsSync(credentialsPath)) {
    fs.writeFileSync(credentialsPath, JSON.stringify(defaultCredentials, null, 2));
    console.log('✅ Plantilla de credenciales creada en config/default-credentials.json');
  }
};

// Ejecutar configuración completa
const runSetup = () => {
  console.log('🔄 Iniciando configuración automática...\n');

  const encryptionKey = generateEncryptionKey();
  console.log('🔑 Clave de cifrado generada automáticamente');

  setupEnvFile(encryptionKey);
  createDirectoryStructure();
  createDefaultCredentials();

  console.log('\n🎉 ¡Configuración completada!');
  console.log('\n🚀 Para iniciar:');
  console.log('   npm install');
  console.log('   npm run dev');
};

runSetup();
