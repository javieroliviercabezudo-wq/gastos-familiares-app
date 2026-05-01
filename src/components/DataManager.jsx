import { useSelector, useDispatch } from 'react-redux'
import { clearAll, importData } from '../features/expenses/expenseSlice'
import { useRef } from 'react'

export default function DataManager() {
  const dispatch = useDispatch()
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const categories = useSelector(state => state.expenses.categories)
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const data = {
      expenses,
      budgetItems,
      categories,
      exportDate: new Date().toISOString()
    }
    
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        
        if (!data.expenses && !data.budgetItems && !data.categories) {
          alert('El archivo no tiene el formato correcto')
          return
        }

        const confirmImport = window.confirm(
          '¿Importar datos? Esto reemplazará los datos actuales. Se recomienda hacer un export antes.'
        )

        if (confirmImport) {
          dispatch(importData({
            expenses: data.expenses || [],
            budgetItems: data.budgetItems || [],
            categories: data.categories || []
          }))
          alert('Datos importados correctamente')
        }
      } catch (error) {
        alert('Error al leer el archivo: ' + error.message)
      }
    }
    reader.readAsText(file)
    
    e.target.value = ''
  }

  const handleClearAll = () => {
    const confirm = window.confirm(
      '¿Estás seguro de borrar TODOS los datos? Esta acción no se puede deshacer.'
    )
    if (confirm) {
      dispatch(clearAll())
      alert('Todos los datos han sido eliminados')
    }
  }

  return (
    <div className="data-manager">
      <h2>Gestión de Datos</h2>
      
      <div className="data-stats">
        <div className="stat-item">
          <span className="stat-label">Gastos:</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Presupuestos:</span>
          <span className="stat-value">{budgetItems.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Categorías:</span>
          <span className="stat-value">{categories.length}</span>
        </div>
      </div>

      <div className="data-actions">
        <button className="export-btn" onClick={handleExport}>
          📥 Exportar Datos (JSON)
        </button>
        
        <div className="import-wrapper">
          <button 
            className="import-btn" 
            onClick={() => fileInputRef.current.click()}
          >
            📤 Importar Datos (JSON)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>

        <button className="clear-btn" onClick={handleClearAll}>
          🗑️ Borrar Todos los Datos
        </button>
      </div>

      <div className="data-info">
        <h3>Información</h3>
        <ul>
          <li>El archivo JSON incluye gastos, presupuestos y categorías</li>
          <li>Se recomienda exportar antes de importar nuevos datos</li>
          <li>Los datos se guardan localmente en tu navegador</li>
        </ul>
      </div>
    </div>
  )
}
