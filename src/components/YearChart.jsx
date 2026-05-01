import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function YearChart() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  
  const yearExpenses = Array(12).fill(0)
  expenses.forEach(e => {
    const d = new Date(e.date)
    if (d.getFullYear() === selectedYear) {
      yearExpenses[d.getMonth()] += e.amount
    }
  })

  const yearBudget = Array(12).fill(0)
  budgetItems.forEach(b => {
    if (b.year === selectedYear && parseInt(b.month) >= 0 && parseInt(b.month) < 12) {
      yearBudget[parseInt(b.month)] += b.amount
    }
  })

  const accumulatedExpense = [...yearExpenses]
  for (let i = 1; i < 12; i++) {
    accumulatedExpense[i] += accumulatedExpense[i - 1]
  }

  const accumulatedBudget = [...yearBudget]
  for (let i = 1; i < 12; i++) {
    accumulatedBudget[i] += accumulatedBudget[i - 1]
  }

  const currentMonth = new Date().getMonth()
  const labels = MESES.slice(0, selectedYear === new Date().getFullYear() ? currentMonth + 1 : 12)
  
  const data = {
    labels: [...labels, 'Total'],
    datasets: [
      {
        label: 'Gastos del Mes',
        data: [...yearExpenses.slice(0, labels.length), accumulatedExpense[labels.length - 1] || 0],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Presupuesto del Mes',
        data: [...yearBudget.slice(0, labels.length), accumulatedBudget[labels.length - 1] || 0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: false },
      y: {
        beginAtZero: true,
        ticks: { callback: value => '$' + value }
      }
    }
  }

  return (
    <div className="year-chart">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius)' }}
        >
          {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <h2>Gastos vs Presupuesto {selectedYear}</h2>
      <Bar data={data} options={options} />
      <div className="chart-summary">
        <div className="summary-item expense">
          <span className="label">Total Gastos:</span>
          <span className="value">${accumulatedExpense[labels.length - 1]?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-item budget">
          <span className="label">Total Presupuesto:</span>
          <span className="value">${accumulatedBudget[labels.length - 1]?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  )
}
