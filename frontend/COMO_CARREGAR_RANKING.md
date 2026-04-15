# 🚀 Como Fazer o Ranking Carregar em 5 Passos

## ✅ Passo 1: Inicie o Backend
```bash
cd backend
npm start
```

**Procure por esta mensagem no terminal:**
```
✅ Banco de dados inicializado com sucesso
🚀 Backend rodando na porta 5000
```

---

## ✅ Passo 2: Inicie o Frontend
```bash
cd frontend
npm start
```

**Abrirá automaticamente em:** `http://localhost:3000`

---

## ✅ Passo 3: Crie uma Conta (se não tiver)
1. Vá em `/register`
2. Preencha:
   - 👤 Nome: Ex: `Gusta123`
   - 📧 Email: Ex: `gusta@email.com`
   - 🔒 Senha: Ex: `123456`
3. Clique "Registrar"

**Repita para criar 2-3 usuários diferentes** (vai ter mais gente no ranking)

---

## ✅ Passo 4: Adicione Faturamentos
1. Faça login com um usuário
2. Vá em "Adicionar Faturamento" (botão laranja)
3. Preencha:
   - 💰 Valor: Ex: `2500000` (2,5 milhões)
   - 📅 Data: Ex: `2026-04-14`
4. Clique "Adicionar"

**Repita com outros usuários com valores diferentes:**
- Usuário 1: 2.500.000
- Usuário 2: 2.300.000
- Usuário 3: 1.800.000

---

## ✅ Passo 5: Vá pro Ranking
1. Clique no menu "Ranking"
2. Você verá:
   - 🏆 Pódium no topo (Top 3)
   - 📊 Leaderboard dinâmico com animações
   - 📋 Botões para trocar de visualização:
     - `🎬 Animado` - Com animações (default)
     - `📋 Simples` - Sem animações
     - `📊 Tabela` - Visualização retrô

---

## 🎯 Pronto!

Agora você verá:
- ✅ Faturamentos aparecem no ranking
- ✅ Animações suaves ao atualizar
- ✅ Badges indicando mudanças
- ✅ Som de vitória quando alguém lidera
- ✅ Barra de progresso de faturamento

---

## 🔧 Se Não Funcionar

### Scenario 1: Vejo "Nenhum participante"
**Solução:**
1. Verifique se criou usuários (Passo 3)
2. Verifique se adicionou faturamentos (Passo 4)
3. Clique "Atualizar" na página de ranking

### Scenario 2: Clico mas nada muda
**Solução:**
1. Abra DevTools: `F12 → Console`
2. Verifique se tem logs:
   - ✅ `Ranking carregado: [...]` → Dados vindo do backend
   - ❌ `Erro ao carregar ranking` → Problema na API

### Scenario 3: Backend não inicia
**Solução:**
```bash
cd backend
npm install
npm start
```

### Scenario 4: Frontend não inicia
**Solução:**
```bash
cd frontend
npm install
npm start
```

---

## 💡 Dica Extra

Use o botão de visualização para teste:

- **🎬 Animado**: Mostra com animações suaves
- **📋 Simples**: Mostra os dados SEM animações (rápido para teste)
- **📊 Tabela**: Visualização simples em tabela

Se dados aparecem em "Simples" mas não em "Animado" → Problema é nas animações.
Se nada aparece em nenhum → Problema é na API.

---

## 📞 Resumo

| Situação | O que fazer |
|----------|-----------|
| Nada aparece | Criar usuários + adicionar faturamentos |
| Aparece só em "Simples" | Problema nas animações, tente "Animado" novamente |
| Aparece em tudo | 🎉 Funcionando perfeitamente! |
| Erro no console | Verifique backend está rodando |

---

**Teste agora e me avise se funciona!** 🚀
