import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { deleteExpenseFromSupabase } from '../features/expenses/expenseSlice'
import { parseLocalDate, formatDisplayDate } from '../utils/dateUtils'

export default function ExpenseList() {
  const expenses = useSelector(state => state.expenses.expenses)
  const dispatch = useDispatch()  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showAllYear, setShowAllYear] = useState(false)
  
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const CURRENT_YEAR = new Date().getFullYear()
  const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - 2 + i)
  
  // Gastos del mes seleccionado
  const monthExpenses = expenses
    .filter(e => {
      const d = parseLocalDate(e.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))

  // Gastos de otros meses del mismo año
  const otherExpenses = expenses
    .filter(e => {
      const d = parseLocalDate(e.date)
      return d.getFullYear() === selectedYear && d.getMonth() !== selectedMonth
    })
    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
  
  return (
    <div className="expense-list">
      {/* Selectores de mes y año */}
      <div className="selectors-row">
        <select 
          className="year-selector"
          value={selectedYear} 
          onChange={e => {
            setSelectedYear(parseInt(e.target.value))
            setShowAllYear(false)
          }}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select 
          className="month-selector"
          value={selectedMonth} 
          onChange={e => {
            setSelectedMonth(parseInt(e.target.value))
            setShowAllYear(false)
          }}
        >
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* Gastos del mes seleccionado */}
      {monthExpenses.length > 0 && (
        <>
          <h2>Gastos de {MESES[selectedMonth]} {selectedYear}</h2>
          <ul>
            {monthExpenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="expense-info">
                  <span className="description">{expense.description}</span>
                  <span className="category">{expense.category}</span>
                  <span className="date">{formatDisplayDate(expense.date)}</span>
                </div>
                <div className="expense-amount">
                  <span>${parseFloat(expense.amount).toFixed(2)}</span>
                  <button className="delete-btn" onClick={() => dispatch(deleteExpenseFromSupabase(expense.id))}>×</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="total">
            Total del mes: ${monthExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </div>
        </>
      )}

      {/* Botón para mostrar/ocultar otros meses */}
      {otherExpenses.length > 0 && (
        <button 
          className="section-btn" 
          onClick={() => setShowAllYear(!showAllYear)}
          style={{marginTop: '1rem'}}
        >
          {showAllYear ? 'Ocultar Otros Meses' : 'Ver Todos los Gastos del Año'}
        </button>
      )}

      {/* Otros gastos del año */}
      {showAllYear && otherExpenses.length > 0 && (
        <>
          <h2>Otros Gastos de {selectedYear}</h2>
          <ul>
            {otherExpenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="expense-info">
                  <span className="description">{expense.description}</span>
                  <span className="category">{expense.category}</span>
                  <span className="date">{formatDisplayDate(expense.date)}</span>
                </div>
                <div className="expense-amount">
                  <span>${parseFloat(expense.amount).toFixed(2)}</span>
                  <button className="delete-btn" onClick={() => dispatch(deleteExpenseFromSupabase(expense.id))}>×</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {monthExpenses.length === 0 && otherExpenses.length === 0 && (
        <p className="empty">No hay gastos registrados para {selectedYear}</p>
      )}
    </div>
  )
}
