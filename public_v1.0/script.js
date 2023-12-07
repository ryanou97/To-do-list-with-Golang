document.addEventListener("DOMContentLoaded", function () {
    fetchTasks();
});

function fetchTasks() {
    fetch("/tasks")
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.textContent = task.name;
                taskList.appendChild(li);
            });
        });
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskName = taskInput.value;

    fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: taskName,
            done: false,
        }),
    })
        .then(response => response.json())
        .then(task => {
            fetchTasks();
            taskInput.value = "";
        });
}
