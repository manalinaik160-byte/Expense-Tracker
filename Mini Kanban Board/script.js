// Mini Kanban Task Manager with drag & drop, priority, due date, dark mode

// Column keys used in localStorage
const COLUMNS = ["todo", "doing", "done"];

// DOM elements for tasks
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");

const columnContainers = {
  todo: document.getElementById("todo-column"),
  doing: document.getElementById("doing-column"),
  done: document.getElementById("done-column"),
};
const columnCounts = {
  todo: document.getElementById("todo-count"),
  doing: document.getElementById("doing-count"),
  done: document.getElementById("done-count"),
};

// Dark mode elements
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const themeToggleText = document.getElementById("theme-toggle-text");

// Drag & drop state
let draggedTaskId = null;
let draggedFromColumn = null;

/**
 * Load board data from localStorage.
 * Adds default priority/dueDate if missing (for older data).
 */
function loadBoardData() {
  const saved = localStorage.getItem("miniKanbanData");
  if (!saved) {
    return { todo: [], doing: [], done: [] };
  }

  try {
    const parsed = JSON.parse(saved);

    const normalizeList = (list) =>
      (Array.isArray(list) ? list : []).map((t) => ({
        id: t.id || Date.now().toString(),
        title: t.title || "",
        priority: t.priority || "medium",
        dueDate: t.dueDate || "",
      }));

    return {
      todo: normalizeList(parsed.todo),
      doing: normalizeList(parsed.doing),
      done: normalizeList(parsed.done),
    };
  } catch (e) {
    console.error("Error reading saved board data, resetting.", e);
    return { todo: [], doing: [], done: [] };
  }
}

/**
 * Save board data to localStorage.
 */
function saveBoardData(boardData) {
  localStorage.setItem("miniKanbanData", JSON.stringify(boardData));
}

/**
 * Create a task object.
 */
function createTask(title, priority, dueDate) {
  return {
    id: Date.now().toString(),
    title,
    priority, // "low" | "medium" | "high"
    dueDate, // "" or "YYYY-MM-DD"
  };
}

/**
 * Create the "empty state" message for a column.
 */
function createEmptyState() {
  const empty = document.createElement("div");
  empty.className =
    "text-xs sm:text-sm text-slate-400 dark:text-slate-500 italic text-center py-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-white/60 dark:bg-slate-900/40";
  empty.textContent = "No tasks yet";
  return empty;
}

/**
 * Get Tailwind classes for a priority label.
 */
function getPriorityClasses(priority) {
  if (priority === "high") {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
  }
  if (priority === "low") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
  }
  // medium
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
}

/**
 * Render the entire board based on stored data.
 */
function renderBoard() {
  const boardData = loadBoardData();

  COLUMNS.forEach((column) => {
    const container = columnContainers[column];
    container.innerHTML = "";

    const tasks = boardData[column];

    // Update count
    columnCounts[column].textContent = `(${tasks.length})`;

    if (tasks.length === 0) {
      container.appendChild(createEmptyState());
      return;
    }

    // Render each task card
    tasks.forEach((task) => {
      const card = createTaskCard(task, column);
      container.appendChild(card);
    });
  });
}

/**
 * Create a DOM card for a task with UI + drag & drop.
 */
function createTaskCard(task, column) {
  const card = document.createElement("div");
  card.className =
    "task-card fade-in bg-white dark:bg-slate-900/70 shadow-sm rounded-xl px-3 py-2.5 flex flex-col gap-2 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing";
  card.setAttribute("draggable", "true");
  card.dataset.id = task.id;
  card.dataset.column = column;

  // Title row with priority pill
  const topRow = document.createElement("div");
  topRow.className = "flex items-start justify-between gap-2";

  const titleEl = document.createElement("div");
  titleEl.className =
    "text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 break-words";
  titleEl.textContent = task.title;

  const priorityPill = document.createElement("span");
  priorityPill.className =
    "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 " +
    getPriorityClasses(task.priority);
  priorityPill.textContent =
    task.priority === "high"
      ? "High"
      : task.priority === "low"
      ? "Low"
      : "Medium";

  topRow.appendChild(titleEl);
  topRow.appendChild(priorityPill);

  // Due date (optional)
  let dueRow = null;
  if (task.dueDate) {
    dueRow = document.createElement("div");
    dueRow.className =
      "flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400";

    dueRow.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H8V3a1 1 0 00-1-1z" />
        <path d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" />
      </svg>
      <span>Due: ${task.dueDate}</span>
    `;
  }

  // Buttons: move left, move right, delete
  const btnContainer = document.createElement("div");
  btnContainer.className = "flex items-center gap-2 mt-1";

  const leftBtn = document.createElement("button");
  leftBtn.className =
    "inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 text-xs shadow-sm transition";
  leftBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.293 15.707a1 1 0 01-1.414 0L6.586 11.414a2 2 0 010-2.828l4.293-4.293a1 1 0 111.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>';

  const rightBtn = document.createElement("button");
  rightBtn.className =
    "inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 text-xs shadow-sm transition";
  rightBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.707 4.293a1 1 0 010 1.414L3.828 10l3.879 3.879a1 1 0 01-1.414 1.414L1.414 10.707a2 2 0 010-2.828L6.293 3.293a1 1 0 011.414 1z" clip-rule="evenodd"/><path d="M11 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z"/></svg>';

  const deleteBtn = document.createElement("button");
  deleteBtn.className =
    "ml-auto inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-500 text-white hover:bg-red-600 text-xs shadow-sm transition";
  deleteBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7 4a2 2 0 00-2 2v1h10V6a2 2 0 00-2-2H7zm-2 5v5a2 2 0 002 2h6a2 2 0 002-2v-5H5z" clip-rule="evenodd"/></svg>';

  // Disable movement where not allowed
  if (column === "todo") {
    leftBtn.disabled = true;
    leftBtn.classList.add("opacity-40", "cursor-not-allowed");
  }
  if (column === "done") {
    rightBtn.disabled = true;
    rightBtn.classList.add("opacity-40", "cursor-not-allowed");
  }

  // Button events
  leftBtn.addEventListener("click", () => {
    moveTask(task.id, column, "left");
  });

  rightBtn.addEventListener("click", () => {
    moveTask(task.id, column, "right");
  });

  deleteBtn.addEventListener("click", (event) => {
    // Simple delete animation: fade/scale then remove
    const cardEl = event.currentTarget.closest(".task-card");
    cardEl.classList.add("opacity-0", "scale-95", "transition", "duration-150");
    setTimeout(() => {
      deleteTask(task.id, column);
    }, 150);
  });

  // Drag events
  card.addEventListener("dragstart", (event) => {
    draggedTaskId = task.id;
    draggedFromColumn = column;
    card.classList.add("opacity-80", "shadow-lg", "ring-2", "ring-sky-400");
    // Required for Firefox
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("dragend", () => {
    draggedTaskId = null;
    draggedFromColumn = null;
    card.classList.remove("opacity-80", "shadow-lg", "ring-2", "ring-sky-400");
  });

  // Build card
  card.appendChild(topRow);
  if (dueRow) {
    card.appendChild(dueRow);
  }
  btnContainer.appendChild(leftBtn);
  btnContainer.appendChild(rightBtn);
  btnContainer.appendChild(deleteBtn);
  card.appendChild(btnContainer);

  return card;
}

/**
 * Handle adding a new task to the "todo" column.
 */
function handleAddTask() {
  const title = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value || "";

  if (title === "") {
    alert("Please enter a task title.");
    return;
  }

  const boardData = loadBoardData();
  boardData.todo.push(createTask(title, priority, dueDate));
  saveBoardData(boardData);

  // Clear inputs
  taskInput.value = "";
  dueDateInput.value = "";

  renderBoard();
}

/**
 * Move a task left or right between columns (buttons).
 */
function moveTask(taskId, fromColumn, direction) {
  const boardData = loadBoardData();
  const fromList = boardData[fromColumn];

  const index = fromList.findIndex((t) => t.id === taskId);
  if (index === -1) return;

  const [task] = fromList.splice(index, 1);

  let targetColumn = fromColumn;

  if (direction === "right") {
    if (fromColumn === "todo") targetColumn = "doing";
    else if (fromColumn === "doing") targetColumn = "done";
  } else if (direction === "left") {
    if (fromColumn === "doing") targetColumn = "todo";
    else if (fromColumn === "done") targetColumn = "doing";
  }

  // If movement is not allowed, put the task back
  if (targetColumn === fromColumn) {
    fromList.splice(index, 0, task);
  } else {
    boardData[targetColumn].push(task);
  }

  saveBoardData(boardData);
  renderBoard();
}

/**
 * Move a task directly to a target column (drag & drop).
 */
function moveTaskToColumn(taskId, fromColumn, targetColumn) {
  if (!COLUMNS.includes(targetColumn) || fromColumn === targetColumn) return;

  const boardData = loadBoardData();
  const fromList = boardData[fromColumn];

  const index = fromList.findIndex((t) => t.id === taskId);
  if (index === -1) return;

  const [task] = fromList.splice(index, 1);
  boardData[targetColumn].push(task);

  saveBoardData(boardData);
  renderBoard();
}

/**
 * Delete a task from the board.
 */
function deleteTask(taskId, fromColumn) {
  const boardData = loadBoardData();
  const list = boardData[fromColumn];

  boardData[fromColumn] = list.filter((t) => t.id !== taskId);

  saveBoardData(boardData);
  renderBoard();
}

/**
 * Drag & drop handlers for columns.
 */
function setupDragAndDrop() {
  COLUMNS.forEach((column) => {
    const container = columnContainers[column];

    container.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      container.classList.add(
        "bg-sky-50",
        "dark:bg-sky-900/30",
        "ring-2",
        "ring-sky-300",
        "dark:ring-sky-500"
      );
    });

    container.addEventListener("dragleave", () => {
      container.classList.remove(
        "bg-sky-50",
        "dark:bg-sky-900/30",
        "ring-2",
        "ring-sky-300",
        "dark:ring-sky-500"
      );
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault();
      container.classList.remove(
        "bg-sky-50",
        "dark:bg-sky-900/30",
        "ring-2",
        "ring-sky-300",
        "dark:ring-sky-500"
      );

      if (!draggedTaskId || !draggedFromColumn) return;

      const targetColumn = container.dataset.column;
      moveTaskToColumn(draggedTaskId, draggedFromColumn, targetColumn);

      draggedTaskId = null;
      draggedFromColumn = null;
    });
  });
}

/**
 * Theme (dark/light mode) helpers.
 */
function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    themeToggleIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707 8.001 8.001 0 1017.293 13.293z"/></svg>';
    themeToggleText.textContent = "Light mode";
  } else {
    root.classList.remove("dark");
    themeToggleIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1.055A7.002 7.002 0 0116.945 9H18a1 1 0 110 2h-1.055A7.002 7.002 0 0111 16.945V18a1 1 0 11-2 0v-1.055A7.002 7.002 0 013.055 11H2a1 1 0 110-2h1.055A7.002 7.002 0 019 4.055V3a1 1 0 011-1z"/></svg>';
    themeToggleText.textContent = "Dark mode";
  }
}

/**
 * Initialize theme from localStorage or system preference.
 */
function initTheme() {
  const storedTheme = localStorage.getItem("miniKanbanTheme");

  if (storedTheme === "dark" || storedTheme === "light") {
    applyTheme(storedTheme);
  } else {
    // Fallback: system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("miniKanbanTheme", newTheme);
  });
}

/**
 * Initialize the app when DOM is ready.
 */
function init() {
  // Add task button
  addTaskBtn.addEventListener("click", handleAddTask);

  // Add task with Enter key
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleAddTask();
    }
  });

  // Setup drag & drop
  setupDragAndDrop();

  // Initialize theme
  initTheme();

  // Initial render
  renderBoard();
}

document.addEventListener("DOMContentLoaded", init);