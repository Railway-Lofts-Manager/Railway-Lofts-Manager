const STORAGE_KEY = "loftCommanderSeasonPlanner";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const tasks = saved ? JSON.parse(saved) : [];
    return Array.isArray(tasks) ? tasks : [];
  } catch { return []; }
}

function saveTasks(tasks) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function createId() { return globalThis.crypto?.randomUUID?.() || `planner-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

const plannerStore = {
  getTasks() { return loadTasks(); },
  addTask(task) {
    const tasks = loadTasks();
    const saved = { ...task, id: createId(), status: "Pending", createdAt: new Date().toISOString() };
    tasks.push(saved); saveTasks(tasks); return saved;
  },
  updateTask(taskId, updates) { saveTasks(loadTasks().map((task) => task.id === taskId ? { ...task, ...updates } : task)); },
  deleteTask(taskId) { saveTasks(loadTasks().filter((task) => task.id !== taskId)); },
  clear() { localStorage.removeItem(STORAGE_KEY); },
};

export default plannerStore;
