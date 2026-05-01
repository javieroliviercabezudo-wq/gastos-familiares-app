import { useState } from 'react'
import { useSelector } from 'react-redux'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - 2 + i)

export default function Summary() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const categories = useSelector(state => state.expenses.categories)

  const filteredExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const getBudgetForCategory = (cat, month, year) => {
    return budgetItems
      .filter(b => b.category === cat && parseInt(b.month) === month && b.year === year)
      .reduce((sum, b) => sum + b.amount, 0)
  }

  return (
    <div className="summary">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="month-total">
        <div className="total-row">
          <span>Total gastado:</span>
          <span className="amount">${totalSpent.toFixed(2)}</span>
        </div>
      </div>
      <h3>Por Rubro</h3>
      {[...categories].sort().map(cat => {
        const spent = filteredExpenses
          .filter(e => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0)
        const budget = getBudgetForCategory(cat, selectedMonth, selectedYear)
        const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
        const cls = pct > 90 ? 'danger' : pct > 70 ? 'warning' : ''

        return (
          <div key={cat} className="summary-row">
            <div className="summary-header">
              <span className="summary-cat">{cat}</span>
            </div>
            <div className="category-bars">
              <div className="hbar-row">
                <span className="hbar-label">Gastos</span>
                <div className="hbar-container">
                  <div 
                    className="hbar expense-hbar" 
                    style={{ width: `${budget > 0 ? (spent / Math.max(spent, budget, 1)) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="hbar-value">${Math.round(spent)}</span>
              </div>
              <div className="hbar-row">
                <span className="hbar-label">Presupuesto</span>
                <div className="hbar-container">
                  <div 
                    className="hbar budget-hbar" 
                    style={{ width: `${budget > 0 ? (budget / Math.max(spent, budget, 1)) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="hbar-value">${budget > 0 ? Math.round(budget) : 0}</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="accumulated">
        <h3>Acumulado Anual {selectedYear}</h3>
        <p>Total gastos: ${expenses.filter(e => new Date(e.date).getFullYear() === selectedYear).reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</p>
        <p>Total presupuestos: ${budgetItems.filter(b => b.year === selectedYear).reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</p>
      </div>
    </div>
  )
}
