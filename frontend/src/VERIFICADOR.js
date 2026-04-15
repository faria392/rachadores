console.log('%c====== VERIFICADOR DE RANKING ======', 'color: green; font-size: 16px; font-weight: bold;');

console.log('\n%c1️⃣  Verificando Backend...', 'color: blue; font-weight: bold;');
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('%c✅ Backend OK:', 'color: green; font-weight: bold;', data);
    testRanking();
  })
  .catch(e => {
    console.error('%c❌ Backend NÃO está respondendo!', 'color: red; font-weight: bold;');
    console.error('Erro:', e.message);
    console.log('%c→ Inicie o backend com: cd backend && npm start', 'color: orange;');
  });

function testRanking() {
  // 2. Verificar Ranking
  console.log('\n%c2️⃣  Carregando Ranking...', 'color: blue; font-weight: bold;');
  fetch('http://localhost:5000/api/revenue/ranking')
    .then(r => r.json())
    .then(data => {
      console.log('%c✅ Ranking carregado com sucesso!', 'color: green; font-weight: bold;');
      console.table(data);
      
      if (data.length === 0) {
        console.warn('%c⚠️  Nenhum dados no ranking ainda!', 'color: orange; font-weight: bold;');
        console.log('%c→ Crie usuários e adicione faturamentos', 'color: orange;');
      } else {
        console.log(`%c✅ ${data.length} usuários encontrados!`, 'color: green; font-weight: bold;');
        console.log(`%c🏆 1º lugar: ${data[0].name} com R$ ${Number(data[0].total).toLocaleString('pt-BR')}`, 'color: gold; font-weight: bold;');
      }
    })
    .catch(e => {
      console.error('%c❌ Erro ao carregar ranking:', 'color: red; font-weight: bold;', e);
    });
}

console.log('\n%cℹ️  Se tudo acima está verde, o ranking deve funcionar!', 'color: cyan;');
console.log(' └─ Se ainda não aparece, tente:');
console.log('    1. Recarregar página (Ctrl + R)');
console.log('    2. Clicar "Atualizar" na página');
console.log('    3. Mudar para modo "📋 Simples" para teste\n');
