import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchExpenses, fetchBudgetItems, fetchCategories } from './features/expenses/expenseSlice'
import TabNavigation from './components/TabNavigation'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import BudgetManager from './components/BudgetManager'
import CategoryManager from './components/CategoryManager'
import Summary from './components/Summary'
import DataManager from './components/DataManager'
import './App.css'

function App() {
  const dispatch = useDispatch()
  
  // Fetch data on app load
  useEffect(() => {
    dispatch(fetchExpenses())
    dispatch(fetchBudgetItems())
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <h1>Gestion de Gastos Familiares</h1>
        </header>
        <TabNavigation />
        <main>
          <Routes>
            <Route path="/" element={
              <div className="grid">
                <div className="left">
                  <ExpenseForm />
                  <ExpenseList />
                </div>
                <div className="right">
                </div>
              </div>
            } />
            <Route path="/presupuesto" element={<BudgetManager />} />
            <Route path="/categorias" element={<CategoryManager />} />
            <Route path="/datos" element={<DataManager />} />
            <Route path="/resumen" element={<Summary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
