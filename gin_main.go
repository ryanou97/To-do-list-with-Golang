package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type IndexData struct {
	Title   string
	Content string
}

func test(c *gin.Context) {
	data := new(IndexData)
	data.Title = "首頁"
	data.Content = "我的第一個gin首頁"

	//gin.Context 可以直接輸出 HTML
	//參數：response http status code、html template 檔案、template 內的參數
	c.HTML(http.StatusOK, "index.html", data)
}
func main() {
	server := gin.Default()
	server.LoadHTMLGlob("template/*")
	server.GET("/", test)
	server.Run(":8888") //啟動
}
