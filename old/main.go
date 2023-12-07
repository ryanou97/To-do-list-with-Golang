package main

import (
	"log"      // 用來輸出程式目前執行狀態
	"net/http" // 網頁運行
)

// 建立 request handler
func test1(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK) // = 200
	w.Write([]byte(`my first website`))
}

func test2(w http.ResponseWriter, r *http.Request) {
	str := `
	<!DOCTYPE html>
	<html>
		<head><title>首頁</title></head>
		<body><h1>首頁</h1><p>我的第一個首頁</p></body>
	</html>
	`
	w.Write([]byte(str))
}

func main() {
	// 加入routing
	// 讓 server 知道當進來的 traffic 的 routing 為 / 時要執行 test 方法
	http.HandleFunc("/", test2)

	// 運行伺服器
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
