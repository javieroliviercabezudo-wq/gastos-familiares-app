import { useSelector } from 'react-redux'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORES = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF']

export default function ExpenseChart() {
  const expenses = useSelector(state => state.expenses.expenses)
  const currentMonth = new Date().getMonth().toString()

  if (expenses.length === 0) return <p className="empty">No hay datos para mostrar</p>

  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth().toString() === currentMonth
  })

  if (monthExpenses.length === 0) return <p className="empty">No hay gastos este mes</p>

  const categoryTotals = {}
  monthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: COLORES.slice(0, Object.keys(categoryTotals).length),
      borderWidth: 2,
      hoverOffset: 4
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  }

  return (
    <div className="expense-chart">
      <h2>Distribución por Categoría - {new Date().toLocaleString('es', { month: 'long' })}</h2>
      <Pie data={data} options={options} />
    </div>
  )
}
