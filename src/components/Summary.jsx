import { useState } from 'react'
import { useSelector } from 'react-redux'
import { parseLocalDate, formatDisplayDate } from '../utils/dateUtils'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - 2 + i)

export default function Summary() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const categories = useSelector(state => state.expenses.categories)

  const [selectedCategory, setSelectedCategory] = useState(null)

  // Calcular gastos y presupuesto por mes
  const monthlyData = MESES.map((mes, monthIndex) => {
    const monthExpenses = expenses.filter(e => {
      const d = parseLocalDate(e.date)
      return d.getMonth() === monthIndex && d.getFullYear() === selectedYear
    })
    const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    const monthBudget = budgetItems
      .filter(b => parseInt(b.month) === monthIndex && b.year === selectedYear)
      .reduce((sum, b) => sum + b.amount, 0)
    
    return {
      month: monthIndex,
      monthName: mes,
      monthShort: MESES_CORTOS[monthIndex],
      spent: monthSpent,
      budget: monthBudget
    }
  })

  const totalSpent = monthlyData.reduce((sum, m) => sum + m.spent, 0)
  const totalBudget = monthlyData.reduce((sum, m) => sum + m.budget, 0)

  const handleCategoryClick = (cat) => {
    setSelectedCategory(selectedCategory === cat ? null : cat)
  }

  const selectedCatExpenses = selectedCategory ? 
    expenses.filter(e => {
      const d = parseLocalDate(e.date)
      return e.category === selectedCategory && d.getFullYear() === selectedYear
    }) : []
  
  const selectedCatBudgets = selectedCategory ? 
    budgetItems.filter(b => b.category === selectedCategory && b.year === selectedYear) : []

  // Encontrar el máximo para escalar las barras
  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.spent, m.budget)), 1)

  return (
    <div className="summary">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="month-total">
        <div className="total-row">
          <span>Total gastado {selectedYear}:</span>
          <span className="amount expense-color">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Total presupuestado {selectedYear}:</span>
          <span className="amount budget-color">${totalBudget.toFixed(2)}</span>
        </div>
      </div>

      <h3>Gastos vs Presupuesto por Mes</h3>
      <div className="monthly-chart">
        {monthlyData.map(m => (
          <div key={m.month} className="month-column">
            <div className="month-bars">
              <div 
                className="month-bar expense-bar" 
                style={{ height: `${(m.spent / maxValue) * 100}%` }}
                title={`Gastos: $${m.spent.toFixed(2)}`}
              ></div>
              <div 
                className="month-bar budget-bar" 
                style={{ height: `${(m.budget / maxValue) * 100}%` }}
                title={`Presupuesto: $${m.budget.toFixed(2)}`}
              ></div>
            </div>
            <div className="month-label">{m.monthShort}</div>
            <div className="month-values">
              <span className="expense-color">${Math.round(m.spent)}</span>
              <span className="budget-color">${Math.round(m.budget)}</span>
            </div>
          </div>
        ))}
      </div>

      <h3>Por Rubro (clic para detalles)</h3>
      {[...categories].sort().map(cat => {
        const catExpenses = expenses.filter(e => {
          const d = parseLocalDate(e.date)
          return e.category === cat && d.getFullYear() === selectedYear
        })
        const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0)
        const budget = budgetItems
          .filter(b => b.category === cat && b.year === selectedYear)
          .reduce((sum, b) => sum + b.amount, 0)
        
        return (
          <div key={cat} className="summary-row" onClick={() => handleCategoryClick(cat)} style={{cursor: 'pointer'}}>
            <div className="summary-header">
              <span className="summary-cat">{cat}</span>
              <span className="summary-values">
                <span className="expense-color">${Math.round(spent)}</span>
                <span> / </span>
                <span className="budget-color">${Math.round(budget)}</span>
              </span>
            </div>
            {selectedCategory === cat && (
              <div className="category-details" onClick={e => e.stopPropagation()}>
                <h4>Gastos de {cat} en {selectedYear}</h4>
                {selectedCatExpenses.length === 0 ? (
                  <p className="empty">No hay gastos para {cat}</p>
                ) : (
                  selectedCatExpenses.map(expense => (
                    <div key={expense.id} className="detail-item">
                      <span>{expense.description}</span>
                      <span>${parseFloat(expense.amount).toFixed(2)}</span>
                      <span>{formatDisplayDate(expense.date)}</span>
                    </div>
                  ))
                )}
                <h4>Presupuestos de {cat} en {selectedYear}</h4>
                {selectedCatBudgets.length === 0 ? (
                  <p className="empty">No hay presupuestos para {cat}</p>
                ) : (
                  selectedCatBudgets.map(item => (
                    <div key={item.id} className="detail-item">
                      <span>{item.description}</span>
                      <span>${parseFloat(item.amount).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
