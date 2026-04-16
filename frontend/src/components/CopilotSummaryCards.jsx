import React from 'react';

function CopilotSummaryCards({ todosOsDados, dataSelecionada }) {
  // Guard against non-array inputs
  const revenues = Array.isArray(todosOsDados?.revenues) ? todosOsDados.revenues : [];
  const expenses = Array.isArray(todosOsDados?.expenses) ? todosOsDados.expenses : [];

  const normalizeDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return String(date).substring(0, 10);
    }
  };

  console.log('🔍 REVENUES:', revenues);
  console.log('🔍 EXPENSES:', expenses);
  console.log('🔍 DATA SELECIONADA:', dataSelecionada);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const obterNomeMes = (dataString) => {
    const data = new Date(dataString + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
  };

  const nomeMes = obterNomeMes(dataSelecionada);

  // Helper functions
  const getDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getLast7Days = (referenceDate) => {
    const reference = new Date(referenceDate);
    const startDate = new Date(reference);
    startDate.setDate(startDate.getDate() - 6);
    return getDateRange(startDate.toISOString().split('T')[0], referenceDate);
  };

  const getMonthRange = (referenceDate) => {
    const reference = new Date(referenceDate);
    const yearMonth = referenceDate.substring(0, 7); // "YYYY-MM"
    return { yearMonth };
  };

  const sumByDateRange = (items, dates) => {
    return items
      .filter((item) => dates.includes(normalizeDate(item.date)))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  };

  const sumByMonth = (items, yearMonth) => {
    return items
      .filter((item) => normalizeDate(item.date).startsWith(yearMonth))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  };

  // Calculate values for Row 1 (Lucro)
  const lucroDia = (() => {
    const revDia = revenues
      .filter((r) => normalizeDate(r.date) === dataSelecionada)
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const expDia = expenses
      .filter((e) => normalizeDate(e.date) === dataSelecionada)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return revDia - expDia;
  })();

  const lucroSemana = (() => {
    const dates = getLast7Days(dataSelecionada);
    const revSemana = sumByDateRange(revenues, dates);
    const expSemana = sumByDateRange(expenses, dates);
    return revSemana - expSemana;
  })();

  const lucroMes = (() => {
    const { yearMonth } = getMonthRange(dataSelecionada);
    const revMes = sumByMonth(revenues, yearMonth);
    const expMes = sumByMonth(expenses, yearMonth);
    return revMes - expMes;
  })();

  const gastosDia = expenses
    .filter((e) => normalizeDate(e.date) === dataSelecionada)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const gastosSemana = sumByDateRange(expenses, getLast7Days(dataSelecionada));

  const gastosMes = (() => {
    const { yearMonth } = getMonthRange(dataSelecionada);
    return sumByMonth(expenses, yearMonth);
  })();

  // Helper to determine profit color
  const getProfitColor = (value) => {
    return value >= 0 ? 'text-orange-400' : 'text-red-500';
  };

  return (
    <div>
      {/* ROW 1: Lucro por Período */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Resumo por Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Lucro do Dia */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Lucro do Dia</p>
            <p className={`text-3xl font-bold ${getProfitColor(lucroDia)}`}>
              {formatarMoeda(lucroDia)}
            </p>
          </div>

          {}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Lucro da Semana</p>
            <p className={`text-3xl font-bold ${getProfitColor(lucroSemana)}`}>
              {formatarMoeda(lucroSemana)}
            </p>
          </div>

          {/* Card 3: Lucro do Mês */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Lucro de {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</p>
            <p className={`text-3xl font-bold ${getProfitColor(lucroMes)}`}>
              {formatarMoeda(lucroMes)}
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: Gastos por Período */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Resumo de Gastos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 4: Gastos do Dia */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Gastos do Dia</p>
            <p className="text-3xl font-bold text-red-400">
              {formatarMoeda(gastosDia)}
            </p>
          </div>

          {/* Card 5: Gastos da Semana */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Gastos da Semana</p>
            <p className="text-3xl font-bold text-red-400">
              {formatarMoeda(gastosSemana)}
            </p>
          </div>

          {/* Card 6: Gastos do Mês */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Gastos de {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</p>
            <p className="text-3xl font-bold text-red-400">
              {formatarMoeda(gastosMes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopilotSummaryCards;
