import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./store/StoreContext.jsx";

const STORAGE_KEY = "todo-lab3";

function getInitialTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function AppInner() {
  const store = useStore();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleAddTask = (title, note) => {
    store.addTask(title, note);
  };

  const handleDeleteConfirm = (id) => {
    store.deleteTask(id);
    setTaskToDelete(null);
  };

  const handleSaveEdit = (id, title, note) => {
    store.editTask(id, title, note);
    setTaskToEdit(null);
  };

  return (
    <div className="page">
      <main className="app">
        <TaskForm onAdd={handleAddTask} />

        <div className="app__inner">
          <TaskList
            pinned={store.pinnedTasks}
            normal={store.normalTasks}
            onEdit={setTaskToEdit}
            onDelete={setTaskToDelete}
            onTogglePin={(task) => store.togglePin(task.id)}
            onMoveNormal={(fromId, toId) => store.moveNormalTask(fromId, toId)}
          />
        </div>
      </main>

      <DeleteDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <EditDialog
        task={taskToEdit}
        onCancel={() => setTaskToEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

function TaskList({
  pinned,
  normal,
  onEdit,
  onDelete,
  onTogglePin,
  onMoveNormal,
}) {
  const hasTasks = pinned.length + normal.length > 0;

  if (!hasTasks) {
    return (
      <section className="empty">
        <p>No tasks</p>
      </section>
    );
  }

  return (
    <>
      <div className="tasks">
        {pinned.length > 0 && (
          <ul className="list list--pinned" role="list">
            {pinned.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                draggable={false}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="tasks__scroll">
        <ul className="list list--normal" role="list">
          {normal.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              draggable={true}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onMove={(fromId, toId) => onMoveNormal(fromId, toId)}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

const TaskItem = observer(function TaskItem({
  task,
  draggable,
  onEdit,
  onDelete,
  onTogglePin,
  onMove,
}) {
  return (
    <li
      className="card task"
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData("text/plain", task.id);
      }}
      onDragOver={(e) => {
        if (!draggable) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!draggable) return;
        const fromId = e.dataTransfer.getData("text/plain");
        const toId = task.id;
        onMove?.(fromId, toId);
      }}
    >
      <div>
        <h3 className="task__title">
          {task.title} {task.pinned && "📌"}
        </h3>
        {task.note && <p className="task__note">{task.note}</p>}
      </div>

      <div className="task__actions">
        <button
          className="icon-btn"
          type="button"
          title={task.pinned ? "Unpin" : "Pin"}
          onClick={() => onTogglePin(task)}
        >
          <span>📌</span>
        </button>

        <button
          className="icon-btn"
          type="button"
          title="Edit"
          onClick={() => onEdit(task)}
        >
          <img src="/img/editButton.png" alt="Edit" />
        </button>

        <button
          className="icon-btn"
          type="button"
          title="Delete"
          onClick={() => onDelete(task)}
        >
          <img src="/img/deleteButton.png" alt="Delete" />
        </button>
      </div>
    </li>
  );
});

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
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
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

export default observer(AppInner);
