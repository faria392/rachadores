import React from 'react';

function CopilotSummaryCards({ todosOsDados, dataSelecionada }) {
  // Guard against non-array inputs
  const revenues = Array.isArray(todosOsDados?.revenues) ? todosOsDados.revenues : [];
  const expenses = Array.isArray(todosOsDados?.expenses) ? todosOsDados.expenses : [];

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
      .filter((item) => dates.includes(item.date))
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  const sumByMonth = (items, yearMonth) => {
    return items
      .filter((item) => item.date.startsWith(yearMonth))
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  // Calculate values for Row 1 (Lucro)
  const lucroDia = (() => {
    const revDia = revenues.filter((r) => r.date === dataSelecionada).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const expDia = expenses.filter((e) => e.date === dataSelecionada).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
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

  // Calculate values for Row 2 (Gastos)
  const gastosDia = expenses
    .filter((e) => e.date === dataSelecionada)
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

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
              R$ {lucroDia.toFixed(2)}
            </p>
          </div>

          {/* Card 2: Lucro da Semana */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Lucro da Semana</p>
            <p className={`text-3xl font-bold ${getProfitColor(lucroSemana)}`}>
              R$ {lucroSemana.toFixed(2)}
            </p>
          </div>

          {/* Card 3: Lucro do Mês */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Lucro do Mês</p>
            <p className={`text-3xl font-bold ${getProfitColor(lucroMes)}`}>
              R$ {lucroMes.toFixed(2)}
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
              R$ {gastosDia.toFixed(2)}
            </p>
          </div>

          {/* Card 5: Gastos da Semana */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Gastos da Semana</p>
            <p className="text-3xl font-bold text-red-400">
              R$ {gastosSemana.toFixed(2)}
            </p>
          </div>

          {/* Card 6: Gastos do Mês */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Gastos do Mês</p>
            <p className="text-3xl font-bold text-red-400">
              R$ {gastosMes.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopilotSummaryCards;
