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

            // 將未完成的任務和已取消勾選的任務分開處理
            const undoneTasks = tasks.filter(task => !task.done);
            const doneTasks = tasks.filter(task => task.done);

            // 將新勾選的任務放到所有任務的最下面
            const sortedDoneTasks = doneTasks.sort((a, b) => a.done - b.done);

            // 將取消勾選的任務放到未勾選的任務的最下面
            const sortedUndoneTasks = undoneTasks.sort((a, b) => b.done - a.done);

            // 合併所有任務
            const sortedTasks = [...sortedUndoneTasks, ...sortedDoneTasks];

            sortedTasks.forEach(task => {
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
    const requestOptions = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            done: done,
        }),
    };

    fetch(`/tasks/${id}`, requestOptions)
        .then(response => response.json())
        .then(task => {
            console.log(`Task ${task.id} updated: done=${task.done}`);
            // 如果取消選取，並且 task 沒有完成，移除刪除線
            if (!done) {
                const taskList = document.getElementById("taskList");
                const taskItem = taskList.querySelector(`[data-task-id="${id}"]`);

                if (taskItem) {
                    taskItem.style.textDecoration = "none";
                }
            }
        })
        .catch(error => {
            console.error("Error updating task status:", error);
        });
}


function formatTime(timeString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    const formattedTime = new Date(timeString).toLocaleDateString(undefined, options);

    // 將斜線替換為短橫線
    return formattedTime.replace(/\//g, '-');
}
