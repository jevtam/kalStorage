import { makeAutoObservable } from "mobx";

const STORAGE_KEY = "todo-lab4-mobx";

function loadInitialTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export class TodoStore {
  tasks = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.tasks = loadInitialTasks();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {
      /*ignore*/
    }
  }

  get pinnedTasks() {
    return this.tasks.filter((t) => t.pinned);
  }

  get normalTasks() {
    return this.tasks.filter((t) => !t.pinned);
  }

  get pinnedCount() {
    return this.tasks.filter((t) => t.pinned).length;
  }

  get orderedTasks() {
    return [...this.tasks].sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });
  }

  addTask(title, note) {
    const task = {
      id: crypto.randomUUID(),
      title,
      note,
      pinned: false,
    };
    this.tasks.unshift(task);
    this.save();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
  }

  editTask(id, title, note) {
    this.tasks = this.tasks.map((t) =>
      t.id === id ? { ...t, title, note } : t
    );
    this.save();
  }

  togglePin(id) {
    const currentPinned = this.pinnedCount;
    this.tasks = this.tasks.map((t) => {
      if (t.id !== id) return t;

      if (!t.pinned && currentPinned >= 3) {
        return t;
      }
      return { ...t, pinned: !t.pinned };
    });
    this.save();
  }

  //drag-n-drop
  moveTask(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const arr = [...this.tasks];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    this.tasks = arr;
    this.save();
  }
  
  moveNormalTask(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;

    const normals = this.tasks.filter((t) => !t.pinned);
    const fromIndex = normals.findIndex((t) => t.id === fromId);
    const toIndex = normals.findIndex((t) => t.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const nextNormals = [...normals];
    const [moved] = nextNormals.splice(fromIndex, 1);
    nextNormals.splice(toIndex, 0, moved);

    const pinned = this.tasks.filter((t) => t.pinned);
    this.tasks = [...pinned, ...nextNormals];

    this.save();
  }
}

export const todoStore = new TodoStore();
