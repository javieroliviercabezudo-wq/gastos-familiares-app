import { configureStore } from '@reduxjs/toolkit'
import expenseReducer from '../features/expenses/expenseSlice'

export const store = configureStore({
  reducer: {
    expenses: expenseReducer
  }
})
