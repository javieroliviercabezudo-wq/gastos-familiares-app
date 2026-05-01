// netlify/functions/dashboard.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, 'data.json');

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Helper: parse a date string (ISO) and return a Date object.
 */
function parseDate(d) {
  return new Date(d);
}

/**
 * GET /dashboard?month=5&year=2026
 * Returns:
 *   - expenses: array of gastos for the requested month
 *   - monthTotal: sum of amounts for that month
 *   - cumulativeTotal: sum of amounts from Jan 1 up to the end of the requested month
 *   - budgets: array of presupuesto entries that match the month (or annual if provided)
 */
exports.handler = async (event) => {
  const { queryStringParameters = {} } = event;
  const month = parseInt(queryStringParameters.month, 10);
  const year = parseInt(queryStringParameters.year, 10);

  if (!month || !year) {
    return { statusCode: 400, body: JSON.stringify({ error: 'month and year are required' }) };
  }

  const db = readData();

  // ---- FILTER EXPENSES ----
  const expenses = db.gastos.filter((g) => {
    const d = parseDate(g.date);
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month; // month is 0‑based in JS
  });

  const monthTotal = expenses.reduce((sum, g) => sum + Number(g.amount || 0), 0);

  // ---- CUMULATIVE TOTAL UP TO END OF MONTH ----
  const cumulative = db.gastos.filter((g) => {
    const d = parseDate(g.date);
    const gYear = d.getUTCFullYear();
    const gMonth = d.getUTCMonth() + 1;
    return gYear < year || (gYear === year && gMonth <= month);
  });
  const cumulativeTotal = cumulative.reduce((sum, g) => sum + Number(g.amount || 0), 0);

  // ---- BUDGETS FOR THE MONTH (and annual if present) ----
  const monthBudgets = db.presupuestos.filter((b) => {
    // presupuesto may have `month` field (1‑12) and `year` (optional). If month matches, include.
    const matchMonth = b.month && parseInt(b.month, 10) === month;
    const matchYear = b.year ? parseInt(b.year, 10) === year : true;
    return matchMonth && matchYear;
  });

  // Annual budget: entries with `annualAmount` (optional) summed.
  const annualBudget = db.presupuestos.reduce((sum, b) => {
    if (b.annualAmount) return sum + Number(b.annualAmount);
    return sum;
  }, 0);

  const response = {
    expenses,
    monthTotal,
    cumulativeTotal,
    budgets: {
      monthBudgets,
      annualBudget,
    },
  };

  return { statusCode: 200, body: JSON.stringify(response) };
};
