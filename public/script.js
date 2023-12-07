document.addEventListener("DOMContentLoaded", function () {
    fetchTasks();

    const taskInput = document.getElementById("taskInput");
    taskInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter" && taskInput.value.trim() !== "") {
            addTask();
        }
    });
});

function fetchTasks() {
    fetch("/tasks")
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";

            tasks.forEach(task => {
                const li = document.createElement("li");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = task.done;
                checkbox.addEventListener("change", function () {
                    updateTaskStatus(task.id, checkbox.checked);
                });

                li.appendChild(checkbox);

                if (task.done) {
                    li.style.textDecoration = "line-through";
                }

                const span = document.createElement("span");
                span.innerHTML = `<span style="float: left; font-weight: bold;">${task.name}</span><span style="float: right;">${formatTime(task.created_time)}</span>`;
                li.appendChild(span);
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

function updateTaskStatus(id, done) {
    if (done) {
        fetch(`/tasks/${id}`, {
            method: "DELETE",
        })
            .then(response => response.json())
            .then(result => {
                console.log(result.message);
                fetchTasks();
            });
    } else {
        fetch(`/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                done: done,
            }),
        })
            .then(response => response.json())
            .then(task => {
                console.log(`Task ${task.id} updated: done=${task.done}`);
                fetchTasks();
            });
    }
}

function formatTime(timeString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    const formattedTime = new Date(timeString).toLocaleDateString(undefined, options);

    // 將斜線替換為短橫線
    return formattedTime.replace(/\//g, '-');
}
