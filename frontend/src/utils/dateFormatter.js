// Formatar data para timezone do Brasil (UTC-3)
export const formatDateBrasil = (dateStr) => {
  if (!dateStr) return '';
  
  // Converter string YYYY-MM-DD para Date
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Validar se a data é válida
  if (isNaN(date.getTime())) return 'Data inválida';
  
  // Array dos dias da semana em português
  const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  
  // Array dos meses em português
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  // Obter o dia da semana
  const diaSemana = diasSemana[date.getDay()];
  
  // Capitalizar primeira letra
  const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  
  // Formatar como "Segunda, 15 de abril"
  return `${diaSemanaCapitalizado}, ${parseInt(day)} de ${meses[date.getMonth()]}`;
};

// Formatar data e hora em hora de Brasília
export const formatDateTimeBrasil = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Obter data de hoje em hora de Brasília
export const getTodayBrasil = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  
  return `${year}-${month}-${day}`;
};

// Normalizar data para formato YYYY-MM-DD
export const normalizeDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';
  
  // Se já está em formato YYYY-MM-DD, retorna assim
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Se está em formato ISO (2026-04-16T00:00:00.000Z), extrai apenas a data
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  
  return dateStr;
};
