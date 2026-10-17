const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const clearCompleted = document.getElementById("clear-completed");
const filters = document.querySelector(".filters");

let tasks = [];

try {
    const saved = JSON.parse(localStorage.getItem("todoTasks"));
    if (Array.isArray(saved)) {
        tasks = saved;
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) li.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.dataset.id = task.id;
        checkbox.dataset.action = "toggle";

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.dataset.action = "edit";
        edit.dataset.id = task.id;

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.className = "delete-btn";
        remove.dataset.action = "delete";
        remove.dataset.id = task.id;

        li.append(checkbox, span, edit, remove);
        taskList.appendChild(li);
    });

    const remaining = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${remaining} task(s) left`;
    emptyMessage.hidden = visibleTasks.length > 0;
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
        id: crypto.randomUUID(),
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskForm.reset();
});

taskList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    if (button.dataset.action === "delete") {
        tasks = tasks.filter(item => item.id !== id);
    }

    if (button.dataset.action === "edit") {
        const updated = prompt("Edit your task:", task.text);

        if (updated === null) return;
        if (!updated.trim()) {
            alert("Task cannot be empty.");
            return;
        }

        task.text = updated.trim();
    }

    saveTasks();
    renderTasks();
});

taskList.addEventListener("change", event => {
    if (event.target.dataset.action !== "toggle") return;

    const task = tasks.find(
        item => item.id === event.target.dataset.id
    );

    if (task) {
        task.completed = event.target.checked;
        saveTasks();
        renderTasks();
    }
});

filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;

    currentFilter = button.dataset.filter;

    filters.querySelectorAll("button").forEach(item => {
        item.classList.toggle("active", item === button);
    });

    renderTasks();
});

clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();