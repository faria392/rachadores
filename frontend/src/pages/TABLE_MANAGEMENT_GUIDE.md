# Gerenciador de Tabelas de Faturamento

Uma solução completa para gerenciar múltiplas tabelas de usuários/contas com funcionalidades avançadas de controle financeiro.

## 🎯 Características Principais

### ✅ Gerenciamento de Tabelas
- **Criar** novas tabelas dinamicamente
- **Deletar** tabelas (remove todos os usuários relacionados)
- **Duplicar** tabelas (copia todos os usuários e configurações)
- **Visualizar** resumo de cada tabela

### 👥 Gerenciamento de Usuários
- **Adicionar** usuários às tabelas
- **Remover** usuários
- **Editar** informações inline na tabela
- **Buscar** por nome, telefone ou CPF

### 💰 Funcionalidades Financeiras
- **Saldo** de cada conta (R$)
- **Cálculo automático** do saldo total
- **Cores automáticas**: verde (positivo), vermelho (negativo)

### 📊 Status e Tipos
- **Status**: Ativa/Inativa
- **Tipo de Conta**: Normal/Conta Mãe (★)
- **Filtros**: Todas, Ativas, Inativas, Contas Mãe

### 📈 Dados de Cada Usuário
- Telefone (obrigatório)
- Nome (obrigatório)
- CPF
- Chave Pix
- Saldo (R$)
- Status (Ativa/Inativa)
- Tipo de Conta (Normal/Mãe)

### 📉 Resumos Automáticos (por tabela)
- Quantidade de contas cadastradas
- Quantidade de contas ativas
- Quantidade de contas inativas
- Saldo total
- Conta mãe (se houver)

## 🚀 Como Usar

### 1. Criar uma Nova Tabela
1. Clique em **"Nova Tabela"**
2. Digite o nome (ex: "69B.com", "69A.com")
3. Clique em **"Criar"**

### 2. Adicionar Usuários
1. Abra a tabela desejada
2. Clique no botão **+ (verde)** no topo da tabela
3. Preencha os dados:
   - **Telefone** ✓ (obrigatório)
   - **Nome** ✓ (obrigatório)
   - CPF (opcional)
   - Chave Pix (opcional)
   - Saldo (R$)
   - Status (Ativa/Inativa)
   - Tipo de Conta (Normal/Conta Mãe)
4. Clique em **"Adicionar"**

### 3. Editar Usuários
- **Mudar Status**: Selecione Ativa/Inativa no dropdown
- **Marcar como Conta Mãe**: Selecione "Conta Mãe" no tipo de conta
  - ⚠️ Apenas 1 conta mãe por tabela
  - Marcar outra automaticamente desmarca a anterior

### 4. Buscar e Filtrar
- **Busca**: Encontre por nome, telefone ou CPF
- **Filtro de Status**:
  - Todas as contas
  - Apenas Ativas
  - Apenas Inativas
  - Contas Mãe

### 5. Gerenciar Tabelas
- **Copiar Tabela**: Clique no ícone de cópia (duplica tabela + usuários)
- **Deletar Tabela**: Clique no ícone de lixeira

## 📱 Responsividade
A aplicação é totalmente responsiva:
- **Desktop**: Visualização completa com todas as colunas
- **Tablet**: Layout adaptado
- **Mobile**: Scroll horizontal na tabela

## 💾 Persistência
Todos os dados são salvos automaticamente no **banco de dados** (MySQL):
- Tabelas
- Usuários
- Saldos
- Status
- Tipo de conta

## 🔐 Segurança
- Autenticação por JWT
- Cada usuário vê apenas suas tabelas
- Permissões validadas no backend

## 📊 Exemplo de Estrutura

```
Tabela: 69B.com
├─ Conta 1
│  ├─ Telefone: (11) 99999-0001
│  ├─ CPF: 123.456.789-00
│  ├─ Saldo: R$ 1.500,00 ✓ (verde - positivo)
│  ├─ Status: Ativa ✓
│  └─ Tipo: Conta Mãe ★
├─ Conta 2
│  ├─ Telefone: (11) 99999-0002
│  ├─ Saldo: R$ -250,00 ✗ (vermelho - negativo)
│  └─ Status: Ativa
└─ Resumo:
   ├─ Cadastradas: 2
   ├─ Ativas: 2
   ├─ Inativas: 0
   └─ Saldo Total: R$ 1.250,00
```

## 🛠️ Tecnologias
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL
- **Ícones**: Lucide React

## 📝 Notas Importantes

1. **Campos Obrigatórios**:
   - Telefone
   - Nome

2. **Conta Mãe**:
   - Apenas 1 por tabela
   - Destaque visual em laranja
   - Usar para identificar conta principal/gerenciadora

3. **Deletar é Permanente**:
   - Deletar tabela remove todos os usuários
   - Sem possibilidade de desfazer

4. **Busca e Filtro**:
   - Funcionam independentemente
   - Podem ser usados juntos

## 🎨 Cores e Visual

- **Verde**: Contas Ativas, Saldo Positivo
- **Vermelho**: Contas Inativas, Saldo Negativo
- **Laranja**: Conta Mãe, Valores Totais
- **Azul**: Ações, Botões Principais
- **Cinza**: Dados Neutros

## ❓ FAQ

**P: Posso deletar uma tabela com usuários?**
R: Sim, ao deletar uma tabela, todos os usuários serão removidos também.

**P: Quantas contas mãe posso ter por tabela?**
R: Apenas 1. Se marcar outra, a anterior perde o status automaticamente.

**P: Os dados são persistidos?**
R: Sim, todos os dados são salvos no banco MySQL automaticamente.

**P: Posso duplicar uma tabela?**
R: Sim, clique no ícone de cópia. A nova tabela terá "(cópia)" no nome e conterá os mesmos usuários.

---

**Desenvolvido para gerenciamento eficiente de múltiplas contas e tabelas financeiras** 💼
