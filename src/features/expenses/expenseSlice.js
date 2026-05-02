import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../supabaseClient'

// Thunks for async operations
const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return data || []
  }
)

const addExpenseToSupabase = createAsyncThunk(
  'expenses/addExpense',
  async (expense) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
    if (error) throw error
    return data[0]
  }
)

const deleteExpenseFromSupabase = createAsyncThunk(
  'expenses/deleteExpense',
  async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
    return id
  }
)

const updateExpenseInSupabase = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
)

const fetchBudgetItems = createAsyncThunk(
  'expenses/fetchBudgetItems',
  async () => {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
    if (error) throw error
    return data || []
  }
)

const addBudgetItemToSupabase = createAsyncThunk(
  'expenses/addBudgetItem',
  async (item) => {
    const { data, error } = await supabase
      .from('budget_items')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  }
)

const deleteBudgetItemFromSupabase = createAsyncThunk(
  'expenses/deleteBudgetItem',
  async (id) => {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id)
    if (error) throw error
    return id
  }
)

const fetchCategories = createAsyncThunk(
  'expenses/fetchCategories',
  async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
    if (error) throw error
    return data ? data.map(c => c.name) : []
  }
)

const addCategoryToSupabase = createAsyncThunk(
  'expenses/addCategory',
  async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: category }])
      .select()
    if (error) throw error
    return category
  }
)

const deleteCategoryFromSupabase = createAsyncThunk(
  'expenses/deleteCategory',
  async (category) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', category)
    if (error) throw error
    return category
  }
)

const initialState = {
  expenses: [],
  categories: ['Supermercado','Vehículos','Regalos','Vacaciones','Salud','Servicios','Ropa','Animales','Mantenimiento casa','Librería','Deportes','Varios','Recreación y Salidas'],
  budgetItems: [],
  loading: false,
  error: null
}

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    updateExpense: (state, action) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.expenses[index] = {
          ...state.expenses[index],
          ...action.payload.updates,
          amount: parseFloat(action.payload.updates.amount || state.expenses[index].amount)
        }
      }
    },
    updateBudgetItem: (state, action) => {
      const index = state.budgetItems.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.budgetItems[index] = {
          ...state.budgetItems[index],
          ...action.payload.updates,
          amount: parseFloat(action.payload.updates.amount || state.budgetItems[index].amount)
        }
      }
    },
    clearAll: (state) => {
      state.expenses = []
      state.budgetItems = []
      state.categories = ['Supermercado','Vehículos','Regalos','Vacaciones','Salud','Servicios','Ropa','Animales','Mantenimiento casa','Librería','Deportes','Varios','Recreación y Salidas']
    },
    importData: (state, action) => {
      const { expenses, budgetItems, categories } = action.payload
      if (expenses && Array.isArray(expenses)) {
        state.expenses = expenses.map(e => ({
          ...e,
          amount: parseFloat(e.amount)
        }))
      }
      if (budgetItems && Array.isArray(budgetItems)) {
        state.budgetItems = budgetItems.map(b => ({
          ...b,
          amount: parseFloat(b.amount)
        }))
      }
      if (categories && Array.isArray(categories)) {
        state.categories = categories
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload.map(e => ({
          ...e,
          amount: parseFloat(e.amount)
        }))
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(addExpenseToSupabase.fulfilled, (state, action) => {
        state.expenses.unshift({
          ...action.payload,
          amount: parseFloat(action.payload.amount)
        })
      })
      .addCase(deleteExpenseFromSupabase.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload)
      })
      .addCase(updateExpenseInSupabase.fulfilled, (state, action) => {
        state.expenses = state.expenses.map(expense => 
          expense.id === action.payload.id 
            ? { 
                ...expense, 
                ...action.payload, 
                amount: parseFloat(action.payload.amount || expense.amount) 
              }
            : expense
        )
      })
      .addCase(fetchBudgetItems.fulfilled, (state, action) => {
        state.budgetItems = action.payload.map(b => ({
          ...b,
          amount: parseFloat(b.amount)
        }))
      })
      .addCase(addBudgetItemToSupabase.fulfilled, (state, action) => {
        state.budgetItems.unshift({
          ...action.payload,
          amount: parseFloat(action.payload.amount)
        })
      })
      .addCase(deleteBudgetItemFromSupabase.fulfilled, (state, action) => {
        state.budgetItems = state.budgetItems.filter(b => b.id !== action.payload)
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        // Keep default categories and add any from Supabase without duplicates
        const defaultCategories = ['Supermercado','Vehículos','Regalos','Vacaciones','Salud','Servicios','Ropa','Animales','Mantenimiento casa','Librería','Deportes','Varios','Recreación y Salidas']
        const supabaseCategories = action.payload || []
        // Combine without duplicates
        const allCategories = [...defaultCategories]
        supabaseCategories.forEach(cat => {
          if (!allCategories.includes(cat)) {
            allCategories.push(cat)
          }
        })
        state.categories = allCategories
      })
      .addCase(addCategoryToSupabase.fulfilled, (state, action) => {
        if (!state.categories.includes(action.payload)) {
          state.categories.push(action.payload)
        }
      })
      .addCase(deleteCategoryFromSupabase.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c !== action.payload)
      })
  }
})

export const {
  updateExpense, updateBudgetItem,
  clearAll, importData
} = expenseSlice.actions

export { 
  fetchExpenses, addExpenseToSupabase, deleteExpenseFromSupabase, updateExpenseInSupabase,
  fetchBudgetItems, addBudgetItemToSupabase, deleteBudgetItemFromSupabase,
  fetchCategories, addCategoryToSupabase, deleteCategoryFromSupabase
}

export default expenseSlice.reducer
