import { useSelector, useDispatch } from 'react-redux'
import { deleteExpenseFromSupabase } from '../features/expenses/expenseSlice'
import { parseLocalDate, formatDisplayDate } from '../utils/dateUtils'

export default function ExpenseList() {
  const expenses = useSelector(state => state.expenses.expenses)
  const dispatch = useDispatch()  
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()  
  
  const monthExpenses = expenses
    .filter(e => {
      const d = parseLocalDate(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))

  if (monthExpenses.length === 0) return <p className="empty">No hay gastos registrados para este mes</p>

  return (
    <div className="expense-list">
      <h2>Gastos de {new Date().toLocaleString('es', { month: 'long' })}</h2>
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
    </div>
  )
}
