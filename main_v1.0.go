package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func init() {
	var err error
	// 開啟 MySQL 資料庫連接
	db, err = sql.Open("mysql", "user:1234@tcp(127.0.0.1:3306)/todo_db")
	if err != nil {
		log.Fatal(err)
	}

	// 測試資料庫連接
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	// 創建 tasks 表格
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255),
			done BOOLEAN
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

type Task struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Done bool   `json:"done"`
}

func main() {
	r := gin.Default()

	// 使用CORS中間件處理跨域問題
	r.Use(cors.Default())

	// 添加此路由處理根路徑的請求
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to the ToDo List API"})
	})

	// 定義路由
	r.GET("/tasks", GetTasks)
	r.GET("/tasks/:id", GetTask)
	r.POST("/tasks", CreateTaskHandler)
	r.PUT("/tasks/:id", UpdateTask)
	r.DELETE("/tasks/:id", DeleteTask)

	// 設置靜態文件路徑
	r.Static("/public", "./public")

	// 啟動伺服器
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

// GetTasks 返回所有任務
func GetTasks(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, done FROM tasks")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		if err := rows.Scan(&task.ID, &task.Name, &task.Done); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		tasks = append(tasks, task)
	}

	// 確保當任務列表為空時返回空的 JSON 數組
	if tasks == nil {
		tasks = []Task{}
	}

	c.JSON(http.StatusOK, tasks)
}

// GetTask 返回指定 ID 的任務
func GetTask(c *gin.Context) {
	id := c.Param("id")
	var task Task
	err := db.QueryRow("SELECT id, name, done FROM tasks WHERE id = ?", id).Scan(&task.ID, &task.Name, &task.Done)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// CreateTaskHandler 創建新任務
func CreateTaskHandler(c *gin.Context) {
	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.Exec("INSERT INTO tasks (name, done) VALUES (?, ?)", task.Name, task.Done)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	taskID, _ := result.LastInsertId()
	task.ID = int(taskID)

	c.JSON(http.StatusCreated, task)
}

// UpdateTask 更新指定 ID 的任務
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec("UPDATE tasks SET name = ?, done = ? WHERE id = ?", task.Name, task.Done, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// DeleteTask 刪除指定 ID 的任務
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	_, err := db.Exec("DELETE FROM tasks WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}
