#!/bin/bash

echo "==========================================";
echo "🔍 DIAGNÓSTICO - Sistema Unificado";
echo "==========================================";
echo "";

echo "📋 1. Verificando estrutura de arquivos:";
echo "   - server.js (raiz): $([ -f 'server.js' ] && echo '✓' || echo '❌')";
echo "   - frontend/build/index.html: $([ -f 'frontend/build/index.html' ] && echo '✓' || echo '❌')";
echo "   - backend/src/index.js: $([ -f 'backend/src/index.js' ] && echo '✓' || echo '❌')";
echo "   - package.json: $([ -f 'package.json' ] && echo '✓' || echo '❌')";
echo "";

echo "📦 2. Verificando dependências:";
if [ -d 'node_modules' ]; then
  echo "   ✓ node_modules existe";
  echo "   ✓ express: $(npm list express 2>/dev/null | grep -q 'express@' && echo '✓' || echo '❌')";
  echo "   ✓ cors: $(npm list cors 2>/dev/null | grep -q 'cors@' && echo '✓' || echo '❌')";
else
  echo "   ❌ node_modules NÃO EXISTE";
  echo "   Execute: npm install";
fi
echo "";

echo "🧪 3. Tentando iniciar servidor (5 segundos):";
timeout 5 node server.js 2>&1 | head -20 || true;
echo "";

echo "✅ Diagnóstico completo!";
