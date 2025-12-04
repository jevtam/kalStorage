import { useEffect, useState } from "react";

const STORAGE_KEY = "todo-lab2-react";

function getInitialTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

//форма создания задачи
function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedNote = note.trim();

    if (!trimmedTitle) return;

    onAdd(trimmedTitle, trimmedNote);
    setTitle("");
    setNote("");
  };

  return (
    <form className="task-form" autoComplete="off" onSubmit={handleSubmit}>
      <div className="task-form__fields">
        <input
          className="field"
          type="text"
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="field"
          type="text"
          placeholder="About…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button className="btn btn-add" type="submit" title="Add task">
        <img src="/img/addButton.png" alt="Add" />
      </button>
    </form>
  );
}

//список задач
function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <section className="empty">
        <p>No tasks</p>
      </section>
    );
  }

  return (
    <ul className="list" role="list">
      {tasks.map((t) => (
        <li key={t.id} className="card task">
          <div>
            <h3 className="task__title">{t.title}</h3>
            {t.note && <p className="task__note">{t.note}</p>}
          </div>

          <div className="task__actions">
            <button
              className="icon-btn"
              type="button"
              title="Edit"
              onClick={() => onEdit(t)}
            >
              <img src="/img/editButton.png" alt="Edit" />
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Delete"
              onClick={() => onDelete(t)}
            >
              <img src="/img/deleteButton.png" alt="Delete" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

//диалог удаления
function DeleteDialog({ task, onCancel, onConfirm }) {
  if (!task) return null;

  return (
    <dialog className="dialog card" open>
      <p className="dialog__title">Delete this task?</p>
      <div className="dialog__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          No
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => onConfirm(task.id)}
        >
          Yes
        </button>
      </div>
    </dialog>
  );
}

//диалог редактирования
function EditDialog({ task, onCancel, onSave }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setNote(task.note ?? "");
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedNote = note.trim();
    if (!trimmedTitle) return;

    onSave(task.id, trimmedTitle, trimmedNote);
  };

  return (
    <dialog className="dialog card" open>
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="edit-form__fields">
          <input
            className="field"
            type="text"
            placeholder="Mini input…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="field edit-form__textarea"
            placeholder="Max input…"
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="dialog__actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-accent">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

function App() {
  const [tasks, setTasks] = useState(getInitialTasks);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);

  //синхронизация с localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
    }
  }, [tasks]);

  const handleAddTask = (title, note) => {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      note,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleConfirmDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTaskToDelete(null);
  };

  const handleSaveEdit = (id, title, note) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title, note } : t))
    );
    setTaskToEdit(null);
  };

  return (
    <div className="page">
      <main className="app">
        <TaskForm onAdd={handleAddTask} />

        <div className="app__inner">
          <header className="app__header">
          </header>

          <TaskList
            tasks={tasks}
            onEdit={setTaskToEdit}
            onDelete={setTaskToDelete}
          />
        </div>
      </main>

      <DeleteDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <EditDialog
        key={taskToEdit?.id ?? "none"}
        task={taskToEdit}
        onCancel={() => setTaskToEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default App;
