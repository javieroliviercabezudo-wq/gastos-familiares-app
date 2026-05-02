import { useSelector, useDispatch } from 'react-redux'
import { clearAll, importData } from '../features/expenses/expenseSlice'
import { useRef } from 'react'
import { formatDisplayDate } from '../utils/dateUtils'

export default function DataManager() {
  const dispatch = useDispatch()
  const expenses = useSelector(state => state.expenses.expenses)
  const budgetItems = useSelector(state => state.expenses.budgetItems)
  const categories = useSelector(state => state.expenses.categories)
  const fileInputRef = useRef(null)

  const handleExportJSON = () => {
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

  const handleExportCSV = (type) => {
    let csvContent = ''
    let filename = ''
    
    if (type === 'expenses') {
      // CSV for expenses
      const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto']
      const rows = expenses.map(e => [
        formatDisplayDate(e.date),
        e.description,
        e.category,
        e.amount.toFixed(2)
      ])
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      filename = `gastos-${new Date().toISOString().split('T')[0]}.csv`
    } else if (type === 'budget') {
      // CSV for budget items
      const headers = ['Categoría', 'Descripción', 'Monto', 'Mes', 'Año']
      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      const rows = budgetItems.map(b => [
        b.category,
        b.description,
        b.amount.toFixed(2),
        monthNames[parseInt(b.month)] || b.month,
        b.year
      ])
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      filename = `presupuesto-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      // Combined CSV
      let combined = 'GASTOS\n'
      combined += 'Fecha,Descripción,Categoría,Monto\n'
      expenses.forEach(e => {
        combined += `${formatDisplayDate(e.date)},${e.description},${e.category},${e.amount.toFixed(2)}\n`
      })
      combined += '\nPRESUPUESTOS\n'
      combined += 'Categoría,Descripción,Monto,Mes,Año\n'
      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      budgetItems.forEach(b => {
        combined += `${b.category},${b.description},${b.amount.toFixed(2)},${monthNames[parseInt(b.month)] || b.month},${b.year}\n`
      })
      csvContent = combined
      filename = `gastos-completo-${new Date().toISOString().split('T')[0]}.csv`
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
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
        <button className="export-btn" onClick={handleExportJSON}>
          📥 Exportar Datos (JSON)
        </button>
        <button className="export-btn csv-btn" onClick={() => handleExportCSV('expenses')}>
          📊 Exportar Gastos (CSV)
        </button>
        <button className="export-btn csv-btn" onClick={() => handleExportCSV('budget')}>
          📊 Exportar Presupuesto (CSV)
        </button>
        <button className="export-btn csv-btn" onClick={() => handleExportCSV('all')}>
          📊 Exportar Completo (CSV)
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
