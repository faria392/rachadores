// Formatar data para timezone do Brasil (UTC-3)
export const formatDateBrasil = (dateStr) => {
  if (!dateStr) return '';
  
  // Converter string YYYY-MM-DD para Date
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  
  // Formatar para timezone do Brasil
  const options = {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    locale: 'pt-BR'
  };
  
  return date.toLocaleDateString('pt-BR', options);
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
