import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addCategoryToSupabase, deleteCategoryFromSupabase } from '../features/expenses/expenseSlice'

export default function CategoryManager() {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.expenses.categories)
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    dispatch(addCategoryToSupabase(newCategory.trim()))
    setNewCategory('')
  }

  return (
    <div className="category-manager">
      <h2>Editar Rubros / Categorias</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          placeholder="Nuevo rubro"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>
      <ul className="category-list">
        {[...categories].sort().map(cat => (
          <li key={cat} className="category-item">
            {cat}
            <button className="tag-delete" onClick={() => dispatch(deleteCategoryFromSupabase(cat))}>×</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
