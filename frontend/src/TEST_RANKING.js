// TESTE - Abra o console (F12) e execute estas linhas para verificar os dados:

// 1. Verificar se API está respondendo
console.log('🧪 Test 1: Verificando API...');
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Health Check:', data))
  .catch(e => console.error('❌ Erro:', e));

// 2. Verificar ranking
console.log('\n🧪 Test 2: Carregando ranking...');
fetch('http://localhost:5000/api/revenue/ranking')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Ranking recebido:', data);
    console.log('Total de usuários:', data.length);
    if (data.length > 0) {
      console.log('1º lugar:', data[0].name, 'com', data[0].total);
    }
  })
  .catch(e => console.error('❌ Erro ao buscar ranking:', e));

// 3. Verificar se localStorage tem token
console.log('\n🧪 Test 3: Verificando autenticação...');
const token = localStorage.getItem('token');
console.log('Token presente?', !!token);

// 4. Se quiser adicionar dados de teste (simule faturamentos)
// Obtenha um token válido primeiro, depois execute:
/*
const testData = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/revenue/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: 2500000,
      date: new Date().toISOString().split('T')[0]
    })
  });
  console.log('Resultado:', await res.json());
};
testData();
*/
