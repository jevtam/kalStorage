const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

const STORAGE_KEY = "kal:tasks";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

let tasks = load();

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function render() {
  const editBtn = makeSmallIconButton("img/editButton.png", () =>
    onEdit(task.id)
  );
  const delBtn = makeSmallIconButton("img/deleteButton.png", () =>
    onDelete(task.id)
  );
  actions.append(editBtn, delBtn);

  listEl.innerHTML = "";
  if (!tasks.length) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

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

function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  state.tasks.forEach(renderTask);
  document.getElementById("empty").hidden = state.tasks.length > 0;
}

// ---------- EDIT ----------
const editDlg = document.getElementById("edit");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editNote = document.getElementById("edit-note");

let editingId = null;

function onEdit(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  editingId = id;
  editTitle.value = t.title;
  editNote.value = t.note ?? "";
  editDlg.showModal();
}

editForm.addEventListener("close", () => {
  if (editForm.returnValue !== "save") return;
  if (!editingId) return;

  const idx = state.tasks.findIndex((x) => x.id === editingId);
  if (idx === -1) return;

  state.tasks[idx] = {
    ...state.tasks[idx],
    title: editTitle.value.trim(),
    note: editNote.value.trim(),
  };
  persist();
  renderList();
  editingId = null;
});

function makeSmallIconButton(src, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "small-icon";
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  b.append(img);
  b.addEventListener("click", onClick);
  return b;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (!title) {
    titleInput.reportValidity();
    return;
  }

  const id = crypto.randomUUID?.() || String(Date.now());
  tasks.push({ id, title, note, completed: false });
  save(tasks);
  render();

  form.reset();
  titleInput.focus();
});

listEl.addEventListener("click", (e) => {
  const del = e.target.closest(".js-delete");
  if (del) {
    const li = del.closest("li");
    const id = li?.dataset.id;
    if (!id) return;
    if (confirm("Delete this task?")) {
      tasks = tasks.filter((t) => t.id !== id);
      save(tasks);
      render();
    }
  }
});

listEl.addEventListener("click", (e) => {
  const edit = e.target.closest(".js-edit");
  if (!edit) return;
  alert("Edit is not implemented yet 🙂");
});

document.addEventListener("DOMContentLoaded", render);
