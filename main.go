package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	filesystem "filesystem/file_system"

	"github.com/joho/godotenv"
)

// PageData - структура для передачи данных в шаблон.
type PageData struct {
	FileList []filesystem.FileInfo // FileList - список файлов и директорий.
	EndTime  string                // EndTime - время выполнения программы.
	ErrorMsg string                // ErrorMsg - поле для вывода ошибки при неправильно введенной директории.
	LastPath string                // LastPath - поле для вывода последнего введенного пути.
}

func main() {
	// Загружаем переменные окружения из .env файла
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Ошибка загрузки .env файла")
	}

	port := os.Getenv("SERVER_PORT")

	server := startHTTPServer(port)
	fmt.Printf("Для запуска приложения введите в адресную строку localhost%s\n", port)
	waitForShutdownSignal(server)
}

// startHTTPServer - функция для запуска HTTP-сервера.
func startHTTPServer(addr string) *http.Server {
	server := &http.Server{Addr: addr}

	fs := http.FileServer(http.Dir("web/static"))
	http.Handle("/web/static/", http.StripPrefix("/web/static/", fs))

	// Регистрируем обработчики.
	http.HandleFunc("/", handleFileSystem)

	// Запускаем сервер в отдельной горутине.
	go func() {
		log.Println("Сервер запущен на", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Ошибка при запуске сервера: %v", err)
		}
	}()

	return server
}

// waitForShutdownSignal - функция для ожидания сигнала и graceful shutdown.
func waitForShutdownSignal(server *http.Server) {
	// Создаем контекст, который завершится при получении сигнала os.Interrupt
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Ожидаем завершения контекста (сигнала os.Interrupt)
	<-ctx.Done()

	log.Println("Получен сигнал для остановки сервера...")

	// Создаем контекст с таймаутом для graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Пытаемся корректно завершить работу сервера
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Ошибка при завершении работы сервера: %v", err)
	}

	log.Println("Сервер корректно завершил работу.")
}

// handleFileSystem - функция-обработчик для работы с файловой системой.
func handleFileSystem(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	// Проверяем, есть ли параметры в запросе.
	dirPath, sortType, err := parseFlags(r)
	if err != nil {
		// Если параметры не указаны, просто отображаем форму.
		if dirPath == "" {
			renderTemplate(w, PageData{})
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Собираем информацию о файлах и директориях.
	fileList, err := filesystem.ListDirByReadDir(dirPath)
	if err != nil {
		// Заполняем сообщение об ошибке.
		data := PageData{
			FileList: nil,
			EndTime:  time.Since(startTime).String(),
			ErrorMsg: fmt.Sprintf("Ошибка чтения директории: %v", err),
		}
		renderTemplate(w, data)
		return
	}

	// Сортируем список и переводим в кб/мб/гб
	filesystem.SortFileList(fileList, sortType)
	for i := range fileList {
		fileList[i].Size, fileList[i].Unit = filesystem.ConvertSize(fileList[i].Size)
	}

	totalSize := filesystem.GetDirSize(dirPath)
	endTime := time.Since(startTime).String()
	statTime := time.Since(startTime).Seconds()

	// Создаем структуру данных для шаблона.
	data := PageData{
		FileList: fileList,
		EndTime:  endTime,
		ErrorMsg: "",
		LastPath: dirPath,
	}

	statURL := os.Getenv("STAT_URL")
	statData := map[string]interface{}{
		"root":        dirPath,
		"size":        totalSize,
		"elapsedTime": statTime,
	}
	jsonData, err := json.Marshal(statData)
	if err != nil {
		log.Println("Ошибка при кодировании данных в JSON:", err)
		return
	}

	_, err = http.Post(statURL, "application/json", bytes.NewBuffer(jsonData))
	log.Printf("Отправляем данные: %+v\n", statData)
	if err != nil {
		log.Println("Ошибка при отправке данных на сервер:", err)
	}

	// Отправляем ответ в формате HTML.
	renderTemplate(w, data)
}

// renderTemplate - вспомогательная функция для рендеринга HTML-шаблона.
func renderTemplate(w http.ResponseWriter, data PageData) {
	templateFile := "web/templates/index.html"
	tmpl, err := template.ParseFiles(templateFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("ошибка загрузки шаблона: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, fmt.Sprintf("ошибка при рендеринге шаблона: %v", err), http.StatusInternalServerError)
	}
}

// parseFlags - функция для обработки флагов и их проверки.
func parseFlags(r *http.Request) (string, string, error) {
	// Получаем параметры.
	dirPath := r.URL.Query().Get("root")
	sortType := r.URL.Query().Get("sort")

	if dirPath == "" {
		return "", "", fmt.Errorf("не указана директория(root)")
	}

	if sortType != "asc" && sortType != "desc" {
		return "", "", fmt.Errorf("неправильно указан тип сортировки. Используйте 'asc' или 'desc'")
	}

	return dirPath, sortType, nil
}
