import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addBudgetItemToSupabase, deleteBudgetItemFromSupabase, updateBudgetItem } from '../features/expenses/expenseSlice'
import { parseLocalDate } from '../utils/dateUtils'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - 2 + i)

export default function BudgetManager() {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.expenses.categories)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const expenses = useSelector(state => state.expenses.expenses)
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [form, setForm] = useState({
    description: '',
    amount: '',
    months: Array(12).fill(false)
  })
  const [editingId, setEditingId] = useState(null)
  
  // Compact chart: current month vs expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthExpenses = expenses.filter(e => {
    const d = parseLocalDate(e.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  const totalBudgetChart = budgetItems
    .filter(b => parseInt(b.month) === currentMonth && b.year === currentYear)
    .reduce((sum, b) => sum + b.amount, 0)
  
  const maxValue = Math.max(totalSpent, totalBudgetChart, 1)
  const spentPct = maxValue > 0 ? (totalSpent / maxValue) * 100 : 0
  const budgetPct = maxValue > 0 ? (totalBudgetChart / maxValue) * 100 : 0
  const [showExpandedChart, setShowExpandedChart] = useState(false)
  
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

  const handleMonthToggle = (index) => {
    const newMonths = [...form.months]
    newMonths[index] = !newMonths[index]
    setForm({...form, months: newMonths})
  }

  const handleSelectAll = () => {
    const allSelected = form.months.every(m => m === true)
    setForm({...form, months: Array(12).fill(!allSelected)})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
      
    if (editingId) {
      dispatch(updateBudgetItem({ 
        id: editingId, 
        updates: { description: form.description, amount: parseFloat(form.amount) }
      }))
      setEditingId(null)
    } else {
      const selectedMonths = form.months
        .map((checked, index) => checked ? index : null)
        .filter(val => val !== null)
          
      if (selectedMonths.length === 0) return
      
      selectedMonths.forEach(month => {
        const item = {
          id: Date.now().toString() + month,
          description: form.description,
          amount: parseFloat(form.amount),
          category: selectedCategory,
          month: month.toString(),
          year: selectedYear
        }
        dispatch(addBudgetItemToSupabase(item))
      })
    }
    
    setForm({
      description: '',
      amount: '',
      months: Array(12).fill(false)
    })
  }

  const handleEdit = (item) => {
    const months = Array(12).fill(false)
    if (item.month !== undefined) {
      months[parseInt(item.month)] = true
    }
    setForm({
      description: item.description,
      amount: item.amount.toString(),
      months: months
    })
    setEditingId(item.id)
  }

  const handleCancel = () => {
    setForm({
      description: '',
      amount: '',
      months: Array(12).fill(false)
    })
    setEditingId(null)
  }
  
  // Budget items for SELECTED month/category
  const filteredBudgets = budgetItems.filter(b => 
    b.category === selectedCategory && 
    b.year === selectedYear &&
    parseInt(b.month) === selectedMonth
  )
  
  // Other budgets (same year/category but different month)
  const otherBudgets = budgetItems.filter(b => 
    b.category === selectedCategory && 
    b.year === selectedYear &&
    parseInt(b.month) !== selectedMonth
  )
  
  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalOther = otherBudgets.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="budget-manager">
      <h2>Presupuesto</h2>
      
      {/* Selectors - visible and wrap properly */}
      <div className="selectors-row">
        <select 
          className="category-selector"
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {[...categories].sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
                
        <select 
          className="year-selector"
          value={selectedYear} 
          onChange={e => setSelectedYear(parseInt(e.target.value))}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          className="month-selector"
          value={selectedMonth} 
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
        >
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* Total for SELECTED month/category */}
      <div className="total-budget">
        <span>Total presupuestado para {selectedCategory} en {MESES[selectedMonth]}:</span>
        <span className="total-amount">${totalBudget.toFixed(2)}</span>
      </div>

      <form onSubmit={handleSubmit} className="budget-form">
        <input 
          type="text" 
          placeholder="Descripcion (ej: Luz, Gas, Agua)" 
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
                
        {!editingId && (
          <div className="months-grid">
            <div className="months-header">
              <span>Meses:</span>
              <button type="button" className="select-all-btn" onClick={handleSelectAll}>
                {form.months.every(m => m === true) ? 'Desmarcar todos' : 'Todo el año'}
              </button>
            </div>
            <div className="months-checkboxes">
              {MESES.map((mes, i) => (
                <label key={i} className="month-checkbox">
                  <input 
                    type="checkbox" 
                    checked={form.months[i]} 
                    onChange={() => handleMonthToggle(i)} 
                  />
                  <span>{mes}</span>
                </label>
              ))}
            </div>
          </div>
        )}
                
        <div className="form-buttons">
          <button type="submit">{editingId ? 'Actualizar' : 'Agregar Presupuesto'}</button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
          )}
        </div>
      </form>

      {/* Budget items for SELECTED month first */}
      {filteredBudgets.length > 0 && (
        <>
          <h3>{selectedCategory} - {selectedYear} - {MESES[selectedMonth]} - Presupuestos Cargados</h3>
          <div className="budget-list">
            {filteredBudgets.map(item => (
              <div key={item.id} className="budget-item">
                <div className="budget-info">
                  <span className="budget-desc">{item.description}</span>
                  <span className="budget-amount">${parseFloat(item.amount).toFixed(2)}</span>
                </div>
                <div className="budget-actions">
                  <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                  <button className="tag-delete" onClick={() => dispatch(deleteBudgetItemFromSupabase(item.id))}>×</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Other months budgets */}
      {otherBudgets.length > 0 && (
        <>
          <h3>Otros Presupuestos - {selectedCategory} - {selectedYear}</h3>
          <div className="budget-list">
            {otherBudgets.map(item => (
              <div key={item.id} className="budget-item">
                <div className="budget-info">
                  <span className="budget-desc">{item.description}</span>
                  <span className="budget-month">{MESES[parseInt(item.month)]}</span>
                  <span className="budget-amount">${parseFloat(item.amount).toFixed(2)}</span>
                </div>
                <div className="budget-actions">
                  <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                  <button className="tag-delete" onClick={() => dispatch(deleteBudgetItemFromSupabase(item.id))}>×</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {filteredBudgets.length === 0 && otherBudgets.length === 0 && (
        <p className="empty">No hay presupuestos cargados para {selectedCategory} en {selectedYear}</p>
      )}
    </div>
  )
}
