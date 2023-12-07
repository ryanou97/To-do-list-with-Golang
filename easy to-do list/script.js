// 獲取 input 元素和 taskList 元素
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// 新增任務的函數
function addTask() {
    // 獲取輸入的任務內容
    const taskContent = taskInput.value.trim();

    // 確認任務內容不為空
    if (taskContent !== "") {
        // 建立新的 li 元素
        const newTask = document.createElement("li");

        // 設定 li 的文本內容
        newTask.textContent = taskContent;

        // 監聽 li 的點擊事件，標記完成或取消完成
        newTask.addEventListener("click", toggleTask);

        // 將新建的 li 元素添加到 taskList 中
        taskList.appendChild(newTask);

        // 清空輸入欄
        taskInput.value = "";
    }
}

// 切換任務的完成狀態
function toggleTask(event) {
    // 取得被點擊的 li 元素
    const clickedTask = event.target;

    // 切換完成狀態的 class
    clickedTask.classList.toggle("completed");
}