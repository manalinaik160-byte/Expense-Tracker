// Smart Expense Tracker
// Vanilla JavaScript only – no frameworks.

// --------- State ---------
let expenses = [];
let currentFilter = "All";
let expenseChart = null;

// Category colors for badges and chart
const categoryColors = {
  Food: "#22c55e", // green
  Transport: "#0ea5e9", // blue
  Shopping: "#a855f7", // purple
  Entertainment: "#ec4899", // pink
  Bills: "#ef4444", // red
  Other: "#f97316", // orange
};

// --------- DOM Helpers ---------
const elements = {
  form: document.getElementById("expenseForm"),
  nameInput: document.getElementById("expenseName"),
  amountInput: document.getElementById("expenseAmount"),
  categorySelect: document.getElementById("expenseCategory"),
  filterSelect: document.getElementById("filterCategory"),
  tableBody: document.getElementById("expenseTableBody"),
  totalExpenses: document.getElementById("totalExpenses"),
  totalTransactions: document.getElementById("totalTransactions"),
  highestCategory: document.getElementById("highestCategory"),
  noExpensesMessage: document.getElementById("noExpensesMessage"),
  tableSummary: document.getElementById("tableSummary"),
  exportButton: document.getElementById("exportCsv"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleIcon: document.getElementById("themeToggleIcon"),
  formError: document.getElementById("formError"),
};

// --------- Filter Highlight Helper ---------

function updateFilterHighlight() {
  const value = elements.filterSelect.value;
  if (value === "All") {
    elements.filterSelect.style.backgroundColor = "";
  } else {
    const color = categoryColors[value] || "#64748b";
    elements.filterSelect.style.backgroundColor = color;
  }
}

// --------- Interactive Category Highlight (Card Accent) ---------

function hexToRgba(hex, alpha) {
  const value = String(hex || "").replace("#", "").trim();
  if (value.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCategoryAccent(category) {
  if (!category || category === "All") {
    return { bg: "", text: "" };
  }
  const base = categoryColors[category] || "#64748b";
  return {
    // subtle accent that keeps the glassmorphism vibe
    bg: hexToRgba(base, 0.14),
    text: "#ffffff",
  };
}

function setCardAccent(cardEl, category) {
  if (!cardEl) return;
  const { bg, text } = getCategoryAccent(category);

  // Smooth transitions for background/text changes
  cardEl.classList.add("transition-colors", "duration-300");

  if (!bg) {
    cardEl.style.backgroundColor = "";
    cardEl.style.color = "";
    return;
  }

  cardEl.style.backgroundColor = bg;
  // Keep text readable; most content already uses explicit text-white,
  // but this helps for elements inheriting from parent.
  cardEl.style.color = text;
}

function updateCategoryAccents() {
  // Highlight the "Highest Category" summary card based on filter selection
  const highestCategoryCard = elements.highestCategory?.closest("article");
  setCardAccent(highestCategoryCard, elements.filterSelect.value);

  // Highlight the expense form card based on selected category in the form
  const formCard = elements.form?.closest("div");
  setCardAccent(formCard, elements.categorySelect.value);
}

// --------- Utility Functions ---------

/**
 * Format a number as currency-like string.
 */
function formatAmount(value) {
  const number = Number(value) || 0;
  return "₹" + number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/**
 * Simple animated counter for numbers.
 * It animates from `start` to `end` in `duration` ms.
 */
function animateValue(element, start, end, duration, formatter) {
  if (!element) return;

  const startTime = performance.now();
  const animate = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = start + (end - start) * progress;

    element.textContent = formatter ? formatter(current) : Math.round(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Generate a simple unique id based on timestamp.
 */
function generateId() {
  return "exp_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

// --------- Local Storage ---------

function saveToLocalStorage() {
  localStorage.setItem("smart_expenses", JSON.stringify(expenses));
}

function loadExpenses() {
  const saved = localStorage.getItem("smart_expenses");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        expenses = parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved expenses:", e);
    }
  }
}

function saveThemePreference(isDark) {
  localStorage.setItem("smart_expenses_theme", isDark ? "dark" : "light");
}

function loadThemePreference() {
  return localStorage.getItem("smart_expenses_theme");
}

// --------- Core Logic ---------

function addExpense(event) {
  if (event) event.preventDefault();

  const name = elements.nameInput.value.trim();
  const amountValue = parseFloat(elements.amountInput.value);
  const category = elements.categorySelect.value;

  elements.formError.textContent = "";

  if (!name) {
    elements.formError.textContent = "Please enter an expense name.";
    return;
  }

  if (Number.isNaN(amountValue) || amountValue <= 0) {
    elements.formError.textContent = "Amount must be greater than 0.";
    return;
  }

  const date = new Date().toISOString().slice(0, 10);

  const expense = {
    id: generateId(),
    name,
    amount: amountValue,
    category,
    date,
  };

  expenses.push(expense);
  saveToLocalStorage();

  renderExpenses();
  updateTotal();
  updateChart();

  elements.form.reset();
}

function deleteExpense(id) {
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return;

  expenses.splice(index, 1);
  saveToLocalStorage();

  renderExpenses();
  updateTotal();
  updateChart();
}

/**
 * Calculate and animate dashboard totals.
 */
function updateTotal() {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  // Highest spending category
  const byCategory = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }

  let topCategory = "–";
  let topAmount = 0;
  Object.keys(byCategory).forEach((cat) => {
    if (byCategory[cat] > topAmount) {
      topAmount = byCategory[cat];
      topCategory = cat;
    }
  });

  // Animate numbers
  const currentTotalAmountText = elements.totalExpenses.textContent.replace(
    /[^\d.]/g,
    ""
  );
  const currentTotalAmount = parseFloat(currentTotalAmountText) || 0;

  animateValue(
    elements.totalExpenses,
    currentTotalAmount,
    totalAmount,
    500,
    (v) => formatAmount(v)
  );

  const currentTotalTransactions = parseInt(
    elements.totalTransactions.textContent || "0",
    10
  );
  animateValue(
    elements.totalTransactions,
    currentTotalTransactions,
    totalCount,
    400,
    (v) => Math.round(v).toString()
  );

  elements.highestCategory.textContent = topCategory;

  // Table summary text
  if (totalCount === 0) {
    elements.tableSummary.textContent = "";
  } else {
    elements.tableSummary.textContent = `${totalCount} transaction${
      totalCount > 1 ? "s" : ""
    } • ${formatAmount(totalAmount)} total`;
  }
}

/**
 * Render expense rows in the table, respecting the current filter.
 */
function renderExpenses() {
  elements.tableBody.innerHTML = "";

  const filtered = expenses.filter((e) => {
    if (currentFilter === "All") return true;
    return e.category === currentFilter;
  });

  if (filtered.length === 0) {
    elements.noExpensesMessage.classList.remove("hidden");
  } else {
    elements.noExpensesMessage.classList.add("hidden");
  }

  filtered.forEach((expense) => {
    const tr = document.createElement("tr");
    tr.className =
      "transition-all duration-300 ease-out hover:bg-white/10 dark:hover:bg-slate-800/60";

    // Start with hidden state for slide/fade-in animation
    tr.classList.add("opacity-0", "translate-y-2");

    const nameTd = document.createElement("td");
    nameTd.className = "py-2.5 pr-3 align-middle";
    nameTd.textContent = expense.name;

    const categoryTd = document.createElement("td");
    categoryTd.className = "py-2.5 px-3 align-middle";

    const badge = document.createElement("span");
    let badgeClasses =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ";
    switch (expense.category) {
      case "Food":
        badgeClasses += "bg-green-200 text-green-900";
        break;
      case "Transport":
        badgeClasses += "bg-sky-200 text-sky-900";
        break;
      case "Shopping":
        badgeClasses += "bg-purple-200 text-purple-900";
        break;
      case "Entertainment":
        badgeClasses += "bg-pink-200 text-pink-900";
        break;
      case "Bills":
        badgeClasses += "bg-red-200 text-red-900";
        break;
      default:
        badgeClasses += "bg-orange-200 text-orange-900";
        break;
    }
    badge.className = badgeClasses;
    badge.textContent = expense.category;
    categoryTd.appendChild(badge);

    const amountTd = document.createElement("td");
    amountTd.className = "py-2.5 px-3 text-right align-middle font-semibold";
    amountTd.textContent = formatAmount(expense.amount);

    const dateTd = document.createElement("td");
    dateTd.className = "py-2.5 px-3 align-middle text-xs";
    dateTd.textContent = expense.date;

    const actionTd = document.createElement("td");
    actionTd.className = "py-2.5 pl-3 text-right align-middle";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className =
      "inline-flex items-center justify-center rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300/80";
    deleteButton.addEventListener("click", () => {
      // Optional: quick fade-out animation before removing
      tr.classList.add("opacity-0", "translate-y-1");
      setTimeout(() => deleteExpense(expense.id), 180);
    });

    actionTd.appendChild(deleteButton);

    tr.appendChild(nameTd);
    tr.appendChild(categoryTd);
    tr.appendChild(amountTd);
    tr.appendChild(dateTd);
    tr.appendChild(actionTd);

    elements.tableBody.appendChild(tr);

    // Trigger slide/fade-in animation
    requestAnimationFrame(() => {
      tr.classList.remove("opacity-0", "translate-y-2");
    });
  });
}

/**
 * Build or update the Chart.js doughnut chart.
 */
function updateChart() {
  const totalsByCategory = {};
  expenses.forEach((e) => {
    totalsByCategory[e.category] =
      (totalsByCategory[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totalsByCategory);
  const data = labels.map((label) => totalsByCategory[label]);
  const backgroundColors = labels.map(
    (label) => categoryColors[label] || "#e5e7eb"
  );

  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  if (!expenseChart) {
    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#f9fafb",
              font: { size: 11 },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 600,
        },
      },
    });
  } else {
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.data.datasets[0].backgroundColor = backgroundColors;
    expenseChart.update();
  }
}

// --------- CSV Export ---------

function exportToCsv() {
  if (!expenses.length) {
    alert("No expenses to export yet.");
    return;
  }

  const header = "Name,Category,Amount,Date";
  const rows = expenses.map((e) =>
    [
      e.name.replace(/"/g, '""'),
      e.category,
      e.amount.toFixed(2),
      e.date,
    ].join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const today = new Date().toISOString().slice(0, 10);
  link.download = `expenses-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --------- Theme / Dark Mode ---------

function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    elements.themeToggleIcon.textContent = "🌙";
    elements.themeToggleIcon.classList.remove("text-yellow-300");
    elements.themeToggleIcon.classList.add("text-sky-300");
  } else {
    root.classList.remove("dark");
    elements.themeToggleIcon.textContent = "☀";
    elements.themeToggleIcon.classList.remove("text-sky-300");
    elements.themeToggleIcon.classList.add("text-yellow-300");
  }
  saveThemePreference(isDark);
}

function initTheme() {
  const stored = loadThemePreference();
  if (stored === "dark") {
    applyTheme(true);
  } else if (stored === "light") {
    applyTheme(false);
  } else {
    // Fall back to system preference if no explicit choice is stored
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark);
  }
}

// --------- Event Listeners & Initialization ---------

document.addEventListener("DOMContentLoaded", () => {
  // Theme
  initTheme();

  elements.themeToggle.addEventListener("click", () => {
    const isCurrentlyDark = document.documentElement.classList.contains(
      "dark"
    );
    applyTheme(!isCurrentlyDark);
  });

  // Load saved expenses
  loadExpenses();

  // Initial render
  renderExpenses();
  updateTotal();
  updateChart();

  // Form submit
  elements.form.addEventListener("submit", addExpense);

  // Filter change
  elements.filterSelect.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    renderExpenses();
    updateFilterHighlight();
    updateCategoryAccents();
  });

  // Form category change (accent form card)
  elements.categorySelect.addEventListener("change", () => {
    updateCategoryAccents();
  });

  updateFilterHighlight();
  updateCategoryAccents();

  // Export CSV
  elements.exportButton.addEventListener("click", exportToCsv);
});

