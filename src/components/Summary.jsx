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

  const [showByCategory, setShowByCategory] = useState(false)
  const [showTrend, setShowTrend] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Datos para el gráfico de barras anual (todos los meses)
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

  const totalAnnualSpent = monthlyData.reduce((sum, m) => sum + m.spent, 0)
  const totalAnnualBudget = monthlyData.reduce((sum, m) => sum + m.budget, 0)

  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.spent || 0, m.budget || 0)), 1)

  // Gastos del mes seleccionado (para "Por Rubro")
  const filteredExpenses = expenses.filter(e => {
    const d = parseLocalDate(e.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const getBudgetForCategory = (cat, month, year) => {
    return budgetItems
      .filter(b => b.category === cat && parseInt(b.month) === month && b.year === year)
      .reduce((sum, b) => sum + b.amount, 0)
  }

  const handleCategoryClick = (cat) => {
    setSelectedCategory(selectedCategory === cat ? null : cat)
  }

  const selectedCatExpenses = selectedCategory ? 
    filteredExpenses.filter(e => e.category === selectedCategory) : []
  
  const selectedCatBudgets = selectedCategory ? 
    budgetItems.filter(b => b.category === selectedCategory && 
      parseInt(b.month) === selectedMonth && 
      b.year === selectedYear) : []

  // Datos para gráfico de líneas (presupuesto vs gastos por mes, todos los meses)
  const [selectedTrendCategory, setSelectedTrendCategory] = useState(categories[0] || '')
  
  const lineChartData = MESES.map((mes, monthIndex) => {
    const monthExpenses = expenses.filter(e => {
      const d = parseLocalDate(e.date)
      return d.getMonth() === monthIndex && d.getFullYear() === selectedYear && e.category === selectedTrendCategory
    })
    const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    const monthBudget = budgetItems
      .filter(b => b.category === selectedTrendCategory && parseInt(b.month) === monthIndex && b.year === selectedYear)
      .reduce((sum, b) => sum + b.amount, 0)
    
    return {
      month: monthIndex,
      monthName: mes,
      monthShort: MESES_CORTOS[monthIndex],
      spent: monthSpent,
      budget: monthBudget
    }
  })

  // Calcular valor máximo incluyendo todos los meses (inclusive con datos 0)
  const maxLineValue = Math.max(...lineChartData.map(m => Math.max(m.spent || 0, m.budget || 0)), 100) // Mínimo 100 para evitar gráfico achatado

  return (
    <div className="summary">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Gráfico Anual - SIEMPRE VISIBLE */}
      <div className="annual-chart-section">
        <h3>Evolución de Gastos Anual {selectedYear}</h3>
        <div className="month-total">
          <div className="total-row">
            <span>Total gastos:</span>
            <span className="amount expense-color">${totalAnnualSpent.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Total presupuestos:</span>
            <span className="amount budget-color">${totalAnnualBudget.toFixed(2)}</span>
          </div>
        </div>

        <div className="monthly-chart">
          {monthlyData.map(m => (
            <div key={m.month} className="month-column">
              <div className="month-bars">
                <div 
                  className="month-bar expense-bar" 
                  style={{ height: `${(m.spent / maxValue) * 100}%` }}
                  title={`${m.monthName}: $${m.spent.toFixed(2)}`}
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
      </div>

      {/* Botones para mostrar/ocultar secciones */}
      <div className="section-buttons">
        <button 
          className={`section-btn ${showByCategory ? 'active' : ''}`}
          onClick={() => {
            setShowByCategory(!showByCategory)
            if (!showByCategory) setShowTrend(false)
          }}
        >
          {showByCategory ? 'Ocultar por Rubro' : 'Ver por Rubro'}
        </button>
        <button 
          className={`section-btn ${showTrend ? 'active' : ''}`}
          onClick={() => {
            setShowTrend(!showTrend)
            if (!showTrend) setShowByCategory(false)
          }}
        >
          {showTrend ? 'Ocultar Gráfico' : 'Ver Gráfico de Líneas'}
        </button>
      </div>

      {/* Por Rubro - SE MUESTRA AL HACER CLIC */}
      {showByCategory && (
        <div className="category-section">
          <h3>Por Rubro</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="month-total">
            <div className="total-row">
              <span>Total gastado en {MESES[selectedMonth]}:</span>
              <span className="amount">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
          {[...categories].sort().map(cat => {
            const spent = filteredExpenses
              .filter(e => e.category === cat)
              .reduce((sum, e) => sum + e.amount, 0)
            const budget = getBudgetForCategory(cat, selectedMonth, selectedYear)
            
            return (
              <div key={cat} className="summary-row">
                <div className="summary-header" onClick={() => handleCategoryClick(cat)} style={{cursor: 'pointer'}}>
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
                {selectedCategory === cat && (
                  <div className="category-details">
                    <h4>Gastos de {cat} en {MESES[selectedMonth]}</h4>
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
                    <h4>Presupuestos de {cat} en {MESES[selectedMonth]}</h4>
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
      )}

      {/* Gráfico de Líneas - SE MUESTRA AL HACER CLIC */}
      {showTrend && (
        <div className="line-chart-section">
          <h3>Gráfico de Líneas: {selectedTrendCategory}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <select 
              value={selectedTrendCategory} 
              onChange={e => setSelectedTrendCategory(e.target.value)}
            >
              {[...categories].sort().map(cat => 
                <option key={cat} value={cat}>{cat}</option>
              )}
            </select>
          </div>
          
          <div className="line-chart-container">
             <svg viewBox="0 0 1200 300" className="line-chart">
               {/* Grid lines */}
               {[0, 50, 100, 150, 200, 250].map(y => (
                 <g key={y}>
                   <line x1="50" y1={y} x2="1150" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                   <text x="5" y={y - 5} fontSize="10" fill="#6b7280">
                     {Math.round(maxLineValue * (300 - y) / 300).toFixed(0)}
                   </text>
                 </g>
               ))}

               {/* Budget line */}
               <polyline
                 points={lineChartData.map((m, i) => 
                   `${i * (1100 / 11) + 50},${300 - ((m.budget || 0) / maxLineValue) * 300}`
                 ).join(' ')}
                 fill="none"
                 stroke="#3b82f6"
                 strokeWidth="3"
                 strokeLinejoin="round"
               />
               
               {/* Expense line */}
               <polyline
                 points={lineChartData.map((m, i) => 
                   `${i * (1100 / 11) + 50},${300 - ((m.spent || 0) / maxLineValue) * 300}`
                 ).join(' ')}
                 fill="none"
                 stroke="#ef4444"
                 strokeWidth="3"
                 strokeLinejoin="round"
               />
               
               {/* Budget dots */}
               {lineChartData.map((m, i) => (
                 <circle
                   key={`budget-dot-${i}`}
                   cx={i * (1100 / 11) + 50}
                   cy={300 - ((m.budget || 0) / maxLineValue) * 300}
                   r="4"
                   fill="#3b82f6"
                 />
               ))}
               
               {/* Expense dots */}
               {lineChartData.map((m, i) => (
                 <circle
                   key={`expense-dot-${i}`}
                   cx={i * (1100 / 11) + 50}
                   cy={300 - ((m.spent || 0) / maxLineValue) * 300}
                   r="4"
                   fill="#ef4444"
                 />
               ))}
               
               {/* Month labels */}
               {lineChartData.map((m, i) => (
                 <text 
                   key={i}
                   x={i * (1100 / 11) + 50}
                   y="295"
                   fontSize="10"
                   fill="#6b7280"
                   textAnchor="middle"
                 >
                   {m.monthShort}
                 </text>
               ))}
             </svg>
            
            <div className="line-legend">
              <div className="legend-item">
                <div className="legend-color budget-legend"></div>
                <span>Presupuesto</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense-legend"></div>
                <span>Gastos Reales</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
