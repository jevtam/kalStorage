const STORAGE_KEY = "tt-todo-tasks-v1";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

const confirmDialog = document.getElementById("confirm-dialog");
const confirmCancelBtn = confirmDialog.querySelector(
  '[data-action="cancel"]'
);
const confirmOkBtn = confirmDialog.querySelector('[data-action="confirm"]');

const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editTitleInput = document.getElementById("edit-title");
const editNoteInput = document.getElementById("edit-note");

let tasks = [];
let taskIdToDelete = null;
let taskIdToEdit = null;


loadTasks();
renderTasks();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title,
    note,
    createdAt: Date.now()
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  form.reset();
  titleInput.focus();
});

listEl.addEventListener("click", (event) => {
  const taskItem = event.target.closest(".task");
  if (!taskItem) return;

  const id = taskItem.dataset.id;

  if (event.target.closest(".task__delete-btn")) {
    openDeleteDialog(id);
    return;
  }

  if (event.target.closest(".btn-edit")) {
    openEditDialog(id);
    return;
  }

  if (
    event.target.closest(".btn-share") ||
    event.target.closest(".btn-info")
  ) {
    event.preventDefault();
    return;
  }
});

listEl.addEventListener("pointerdown", (event) => {
  const taskItem = event.target.closest(".task");
  if (!taskItem) return;
  if (event.button !== 0) return;

  let timer = setTimeout(() => {
    toggleTaskMenu(taskItem, true);
  }, 400);

  const cancel = () => {
    clearTimeout(timer);
    listEl.removeEventListener("pointerup", cancel, true);
    listEl.removeEventListener("pointercancel", cancel, true);
    listEl.removeEventListener("pointerleave", cancel, true);
  };

  listEl.addEventListener("pointerup", cancel, true);
  listEl.addEventListener("pointercancel", cancel, true);
  listEl.addEventListener("pointerleave", cancel, true);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".task")) return;
  closeAllMenus();
});


function openDeleteDialog(id) {
  taskIdToDelete = id;
  confirmDialog.showModal();
}

confirmCancelBtn.addEventListener("click", () => {
  taskIdToDelete = null;
  confirmDialog.close();
});

confirmOkBtn.addEventListener("click", () => {
  if (!taskIdToDelete) {
    confirmDialog.close();
    return;
  }

  tasks = tasks.filter((task) => task.id !== taskIdToDelete);
  taskIdToDelete = null;
  saveTasks();
  renderTasks();
  confirmDialog.close();
});

function openEditDialog(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  taskIdToEdit = id;
  editTitleInput.value = task.title;
  editNoteInput.value = task.note;
  editDialog.showModal();
}

editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (editDialog.returnValue === "cancel") {
    taskIdToEdit = null;
    editDialog.close();
    return;
  }

  const task = tasks.find((t) => t.id === taskIdToEdit);
  if (!task) {
    editDialog.close();
    return;
  }

  task.title = editTitleInput.value.trim() || task.title;
  task.note = editNoteInput.value.trim();
  saveTasks();
  renderTasks();
  editDialog.close();
  taskIdToEdit = null;
});


function renderTasks() {
  listEl.innerHTML = "";

  if (!tasks.length) {
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task card";
    li.dataset.id = task.id;

    const main = document.createElement("div");
    main.className = "task__main";

    const textBox = document.createElement("div");

    const titleEl = document.createElement("p");
    titleEl.className = "task__title";
    titleEl.textContent = task.title;
    textBox.appendChild(titleEl);

    if (task.note) {
      const noteEl = document.createElement("p");
      noteEl.className = "task__note";
      noteEl.textContent = task.note;
      textBox.appendChild(noteEl);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task__delete-btn";
    deleteBtn.type = "button";
    deleteBtn.title = "Delete task";

    const deleteImg = document.createElement("img");
    deleteImg.src = "img/deleteButton.png";
    deleteImg.alt = "Delete";
    deleteBtn.appendChild(deleteImg);

    main.appendChild(textBox);
    main.appendChild(deleteBtn);

    const menu = document.createElement("div");
    menu.className = "task__menu";

    const makeIconBtn = (className, src, alt, title) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `icon-btn ${className}`;
      btn.title = title;

      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      btn.appendChild(img);

      return btn;
    };

    const shareBtn = makeIconBtn("btn-share", "img/shareButton.png", "Share", "Share");
    const infoBtn = makeIconBtn("btn-info", "img/infoButton.png", "Info", "Info");
    const editBtn = makeIconBtn("btn-edit", "img/editButton.png", "Edit", "Edit");

    menu.appendChild(shareBtn);
    menu.appendChild(infoBtn);
    menu.appendChild(editBtn);

    li.appendChild(main);
    li.appendChild(menu);

    listEl.appendChild(li);
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      tasks = [];
      return;
    }
    const parsed = JSON.parse(raw);
    tasks = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load tasks from storage", err);
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks to storage", err);
  }
}


function toggleTaskMenu(taskEl, state) {
  closeAllMenus();
  if (state) {
    taskEl.classList.add("task--open");
  } else {
    taskEl.classList.toggle("task--open");
  }
}

function closeAllMenus() {
  document
    .querySelectorAll(".task.task--open")
    .forEach((el) => el.classList.remove("task--open"));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}