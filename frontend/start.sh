#!/bin/bash
set -e

echo "🔧 Instalando dependências..."
npm install

echo "🏗️  Fazendo build..."
npm run build

echo "🚀 Iniciando servidor..."
node server.js
