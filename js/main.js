const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

//диалоги
const confirmDialog = document.getElementById("confirm-dialog");
const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editTitleInput = document.getElementById("edit-title");
const editNoteInput = document.getElementById("edit-note");
const editCancelBtn = document.getElementById("edit-cancel");

const STORAGE_KEY = "kal:tasks";

//работа с localStorage
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

//состояние
let tasks = loadTasks();
let pendingDeleteId = null;
let editingId = null;

//экранирование текста, чтобы не сломать разметку
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

//рендер списка
function render() {
  listEl.innerHTML = "";

  // если задач нет — показываем сообщение и выходим
  if (tasks.length === 0) {
    emptyEl.classList.remove("empty--hidden");
    return;
  }

  // если задачи есть — прячем сообщение
  emptyEl.classList.add("empty--hidden");

  for (const t of tasks) {
    const li = document.createElement("li");
    li.className = "card task";
    li.dataset.id = t.id;
    li.innerHTML = `
      <div>
        <h3 class="task__title">${esc(t.title)}</h3>
        ${t.note ? `<p class="task__note">${esc(t.note)}</p>` : ""}
      </div>
      <div class="task__actions">
        <button class="icon-btn js-edit" type="button" title="Edit">
          <img src="img/editButton.png" alt="Edit" />
        </button>
        <button class="icon-btn js-delete" type="button" title="Delete">
          <img src="img/deleteButton.png" alt="Delete" />
        </button>
      </div>
    `;
    listEl.appendChild(li);
  }
}

//добавление задачи
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (!title) {
    //стандартный браузерный тултип "заполните это поле"
    titleInput.reportValidity();
    return;
  }

  const id = crypto.randomUUID?.() || String(Date.now());

  tasks.push({
    id,
    title,
    note,
  });

  saveTasks();
  render();

  form.reset();
  titleInput.focus();
});

//обработка кликов по списку (delete + edit)
listEl.addEventListener("click", (e) => {
  const delBtn = e.target.closest(".js-delete");
  if (delBtn) {
    const li = delBtn.closest("li");
    if (!li) return;
    pendingDeleteId = li.dataset.id || null;
    if (!pendingDeleteId) return;

    confirmDialog.showModal();
    return;
  }

  const editBtn = e.target.closest(".js-edit");
  if (editBtn) {
    const li = editBtn.closest("li");
    if (!li) return;
    const id = li.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    editingId = id;
    editTitleInput.value = task.title;
    editNoteInput.value = task.note || "";

    editDialog.showModal();
  }
});

//диалог подтверждения удаления
confirmDialog.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "cancel") {
    pendingDeleteId = null;
    confirmDialog.close();
    return;
  }

  if (action === "confirm" && pendingDeleteId) {
    tasks = tasks.filter((t) => t.id !== pendingDeleteId);
    saveTasks();
    render();
    pendingDeleteId = null;
    confirmDialog.close();
  }
});

//диалог редактирования
//cancel
editCancelBtn.addEventListener("click", () => {
  editingId = null;
  editDialog.close();
});

//save
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!editingId) {
    editDialog.close();
    return;
  }

  const title = editTitleInput.value.trim();
  const note = editNoteInput.value.trim();

  if (!title) {
    editTitleInput.reportValidity();
    return;
  }

  const idx = tasks.findIndex((t) => t.id === editingId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], title, note };
    saveTasks();
    render();
  }

  editingId = null;
  editDialog.close();
});

//стартовый рендер
render();
