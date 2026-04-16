export const formatDateBrasil = (dateStr) => {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  if (isNaN(date.getTime())) return 'Data inválida';

  const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const diaSemana = diasSemana[date.getDay()];

  const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  return `${diaSemanaCapitalizado}, ${parseInt(day)} de ${meses[date.getMonth()]}`;
};

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

export const normalizeDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  
  return dateStr;
};
