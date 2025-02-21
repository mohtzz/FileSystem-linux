package main

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"math"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// FileInfo - структура для хранения информации о файле/директории.
type FileInfo struct {
	Name  string  // Name - имя файла.
	Size  float64 // Size - размер файла.
	Unit  string  // Unit - поле для хранения системы счисления размера.
	IsDir bool    // IsDir - является ли директорией.
	Path  string  // Path - поле для перезаписи пути.
}

// PageData - структура для передачи данных в шаблон.
type PageData struct {
	FileList []FileInfo // FileList - список файлов и директорий.
	EndTime  string     // EndTime - время выполнения программы.
	ErrorMsg string     // ErrorMsg - поле для вывода ошибки при неправильно введенной директории.
	LastPath string     // LastPath - поле для вывода последнего введенного пути.
}

func main() {
	port := ":9015"
	server := startHTTPServer(port)
	fmt.Printf("Для запуска приложения введите в адресную строку localhost%s\n", port)
	waitForShutdownSignal(server)
}

// startHTTPServer - функция для запуска HTTP-сервера.
func startHTTPServer(addr string) *http.Server {
	server := &http.Server{Addr: addr}

	fs := http.FileServer(http.Dir("web/static"))
	http.Handle("/web/static/", http.StripPrefix("/web/static/", fs))

	// Регистрируем обработчик.
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
	// Создаем канал для получения сигналов от ОС.
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt)

	// Ожидаем сигнал для graceful shutdown.
	<-stopChan
	log.Println("Получен сигнал для остановки сервера...")

	/* Создаем контекст с таймаутом для graceful shutdown.
	Если после истечения 5 секунд остались какие-то активные запросы
	или сервер не может завершить работу, то сервер выключается принудительно.*/
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Пытаемся корректно завершить работу сервера.
	if err := server.Shutdown(ctx); err != nil {
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
	fileList, err := listDirByReadDir(dirPath)
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
	sortFileList(fileList, sortType)
	for i := range fileList {
		fileList[i].Size, fileList[i].Unit = convertSize(fileList[i].Size)
	}

	endTime := time.Since(startTime).String()

	// Создаем структуру данных для шаблона.
	data := PageData{
		FileList: fileList,
		EndTime:  endTime,
		ErrorMsg: "",
		LastPath: dirPath,
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

// listDirByReadDir - функция для обхода директории и сбора информации.
func listDirByReadDir(path string) ([]FileInfo, error) {
	var fileList []FileInfo
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Читаем содержимое текущей директории.
	filesAndDirs, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("ошибка чтения директории:", err)
		return nil, err
	}

	for _, val := range filesAndDirs {
		wg.Add(1)
		go func(val os.DirEntry) {
			defer wg.Done()
			newPath := filepath.Join(path, val.Name())
			fileInfo := FileInfo{
				Name:  val.Name(),
				IsDir: val.IsDir(),
				Path:  newPath,
			}

			if val.IsDir() {
				// Для директорий вычисляем размер рекурсивно.
				size := getDirSize(newPath)
				fileInfo.Size = size
			} else {
				info, err := val.Info()
				if err != nil {
					fmt.Println("ошибка получения информации о файле:", err)
					return
				}
				fileInfo.Size = float64(info.Size())
			}

			mu.Lock()
			fileList = append(fileList, fileInfo)
			mu.Unlock()
		}(val)
	}

	wg.Wait()
	return fileList, nil
}

// getDirSize - функция для вычисления размера директории.
func getDirSize(path string) float64 {
	var size int64

	// Рекурсивно обходим все файлы и поддиректории.
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			// Для каждой директории добавляем 4096 байт (размер метаданных).
			if info.Name() != filepath.Base(path) {
				size += info.Size()
			}
		} else {
			// Для файлов добавляем их размер.
			size += info.Size()
		}
		return nil
	})
	if err != nil {
		fmt.Println("ошибка при вычислении размера директории:", err)
		return 0
	}

	return float64(size)
}

// sortFileList - функция для сортировки списка файлов и директорий.
func sortFileList(fileList []FileInfo, sortType string) {
	/*функция sort.Slice упорядочивает наши файлы с директориями
	все происходит автоматически, от нас лишь требуется определить функцию сравнения.*/
	sort.Slice(fileList, func(i, j int) bool {
		/*func(i, j int) bool - функция сравнения - определяет, какой элемент должен идти первым в отсортированном списке
		сравнивая элементы при получении true ничего не поменяется - элементы стоят на своих законных местах
		при получении false функция sort.Slice поменяет элементы местами.*/
		if sortType == "asc" {
			return fileList[i].Size < fileList[j].Size
		} else {
			return fileList[i].Size > fileList[j].Size
		}
	})
}

// convertSize - функция для перевода размера в байтах в кб/мб/гб/тб
func convertSize(size float64) (float64, string) {
	counter := 0
	var value string
	for {
		if size >= 1000 {
			size = size / 1000
			counter += 1
		} else {
			break
		}
	}
	switch counter {
	case 0:
		value = "байт"
	case 1:
		value = "килобайт"
	case 2:
		value = "мегабайт"
	case 3:
		value = "гигабайт"
	case 4:
		value = "терабайт"
	}
	roundedSize := math.Round(size*10) / 10
	return roundedSize, value
}
