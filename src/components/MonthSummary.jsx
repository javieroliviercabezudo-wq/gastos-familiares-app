import { useSelector } from 'react-redux'
import { parseLocalDate } from '../utils/dateUtils'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function MonthSummary() {
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const currentMonth = new Date().getMonth()
  const monthName = MESES[currentMonth]

  const currentYear = new Date().getFullYear()
  
  const monthExpenses = expenses.filter(e => {
    const d = parseLocalDate(e.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

  const totalBudget = budgetItems
    .filter(b => parseInt(b.month) === currentMonth && b.year === currentYear)
    .reduce((sum, b) => sum + b.amount, 0)

  const maxValue = Math.max(totalSpent, totalBudget, 1)
  const spentHeight = (totalSpent / maxValue) * 100
  const budgetHeight = (totalBudget / maxValue) * 100

  return (
    <div className="month-summary">
      <h2>Progreso de {monthName}</h2>
      <div className="bars-container">
        <div className="bar-group">
          <div className="bar-wrapper">
            <div 
              className="bar spent" 
              style={{ height: spentHeight + '%' }}
            >
              <span className="bar-value">${totalSpent.toFixed(0)}</span>
            </div>
          </div>
          <span className="bar-title">Gastos</span>
        </div>
        <div className="bar-group">
          <div className="bar-wrapper">
            <div 
              className="bar budget" 
              style={{ height: budgetHeight + '%' }}
            >
              <span className="bar-value">${totalBudget.toFixed(0)}</span>
            </div>
          </div>
          <span className="bar-title">Presupuesto</span>
        </div>
      </div>
    </div>
  )
}
