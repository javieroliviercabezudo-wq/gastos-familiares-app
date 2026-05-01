import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addExpenseToSupabase, updateExpense, deleteExpenseFromSupabase } from '../features/expenses/expenseSlice'

export default function ExpenseForm() {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.expenses.categories)
  const expenses = useSelector(state => state.expenses.expenses)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: categories[0] || '',
    date: new Date().toISOString().split('T')[0]
  })
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
    
    if (editingId) {
      dispatch(updateExpense({ id: editingId, updates: form }))
      setEditingId(null)
    } else {
      const expense = {
        id: Date.now().toString(),
        ...form,
        amount: parseFloat(form.amount)
      }
      dispatch(addExpenseToSupabase(expense))
    }
    
    setForm({
      description: '',
      amount: '',
      category: categories[0] || '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleEdit = (expense) => {
    setForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    })
    setEditingId(expense.id)
  }

  const handleCancel = () => {
    setForm({
      description: '',
      amount: '',
      category: categories[0] || '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingId(null)
  }

  return (
    <div>
      <form className="expense-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Editar Gasto' : 'Cargar Gasto'}</h2>
        <input 
          type="text" 
          placeholder="Descripcion" 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          required 
        />
        <input 
          type="number" 
          placeholder="Monto" 
          value={form.amount} 
          onChange={e => setForm({...form, amount: e.target.value})} 
          step="0.01" 
          min="0" 
          required 
        />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          {[...categories].sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input 
          type="date" 
          value={form.date} 
          onChange={e => setForm({...form, date: e.target.value})} 
          required 
        />
        <div className="form-buttons">
          <button type="submit">{editingId ? 'Actualizar' : 'Agregar Gasto'}</button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
          )}
        </div>
      </form>

      <div className="expense-list">
        <h3>Gastos Cargados</h3>
        {expenses.length === 0 ? (
          <p className="empty">No hay gastos cargados</p>
        ) : (
          expenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <span className="expense-desc">{expense.description}</span>
                <span className="expense-cat">{expense.category}</span>
                <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                <span className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</span>
              </div>
              <div className="expense-actions">
                <button className="edit-btn" onClick={() => handleEdit(expense)}>✏️</button>
                <button className="tag-delete" onClick={() => dispatch(deleteExpenseFromSupabase(expense.id))}>×</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
