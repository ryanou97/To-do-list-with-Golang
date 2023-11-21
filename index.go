package main

import (
	"html/template" // 導入template
	"log"
	"net/http"
)

// 定義好 template 內所要的參數，需與.html對應
type IndexData struct {
	Title   string
	Content string
}

func test(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("./index.html"))
	data := new(IndexData)
	data.Title = "首頁"
	data.Content = "我的第一個首頁"
	tmpl.Execute(w, data)
}

func main() {
	http.HandleFunc("/index", test)
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
