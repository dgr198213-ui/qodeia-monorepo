const fs = require('fs');
const path = require('path');

console.log('📥 Importador de Credenciales Simplificado\n');

console.log('1. Opción: Usar variables de entorno');
console.log('   Ejecuta: export GITHUB_TOKEN="tu_token"\n');

console.log('2. Opción: Crear archivo credentials.local.json');
console.log('   Ubicación: ./config/credentials.local.json\n');

console.log('🔐 Abre http://localhost:5173/credentials después de iniciar la app para usar el asistente visual.');
