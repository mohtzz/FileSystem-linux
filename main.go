package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// Структура для хранения информации о файле/директории
type FileInfo struct {
	Name  string
	Size  int64
	IsDir bool
	Path  string // Добавляем путь для корректного отображения вложенных элементов
}

func main() {

	startTime := time.Now()
	dirPath, sortType, err := parseFlags()
	if err != nil {
		fmt.Println(err)
		return
	}

	// Собираем информацию о файлах и директориях
	fileList, err := listDirByReadDir(dirPath)
	if err != nil {
		fmt.Println("ошибка чтения:", err)
		return
	}

	// Сортируем список
	sortFileList(fileList, sortType)

	// Выводим отсортированный список
	for _, file := range fileList {
		if file.IsDir {
			fmt.Printf("folder [%s] ", file.Name)
			fmt.Println(convertSize(file.Size))
		} else {
			fmt.Printf("file %s ", file.Name)
			fmt.Println(convertSize(file.Size))
		}
	}

	elapsedTime := time.Since(startTime)
	fmt.Printf("Время выполнения программы: %s\n", elapsedTime)
}

// Функция для обработки флагов и их проверки
func parseFlags() (string, string, error) {
	dirPath := flag.String("root", "", "choose a directory")
	sortType := flag.String("sort", "", "choose a type of sort (asc or desc)")
	flag.Parse()

	if *dirPath == "" {
		return "", "", fmt.Errorf("не указана директория")
	}

	if *sortType != "asc" && *sortType != "desc" {
		return "", "", fmt.Errorf("неправильно указан тип сортировки. Используйте 'asc' или 'desc'")
	}

	return *dirPath, *sortType, nil
}

// Функция для рекурсивного обхода директории и сбора информации
func listDirByReadDir(path string) ([]FileInfo, error) {
	var fileList []FileInfo
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Читаем содержимое текущей директории
	filesAndDirs, err := ioutil.ReadDir(path)
	if err != nil {
		fmt.Println("ошибка чтения директории:", err)
		return nil, err
	}

	for _, val := range filesAndDirs {
		wg.Add(1)
		go func(val os.FileInfo) {
			defer wg.Done()
			newPath := filepath.Join(path, val.Name())
			fileInfo := FileInfo{
				Name:  val.Name(),
				IsDir: val.IsDir(),
				Path:  newPath,
			}

			if val.IsDir() {
				// Для директорий вычисляем размер рекурсивно
				size := getDirSize(newPath)
				fileInfo.Size = size
				// Рекурсивно обходим вложенные директории
				nestedFiles, err := listDirByReadDir(newPath)
				if err != nil {
					return
				}
				mu.Lock()
				fileList = append(fileList, nestedFiles...)
				mu.Unlock()
			} else {
				// Для файлов берем размер напрямую
				fileInfo.Size = val.Size()
			}

			mu.Lock()
			fileList = append(fileList, fileInfo)
			mu.Unlock()
		}(val)
	}

	wg.Wait()
	return fileList, nil
}

// Функция для вычисления размера директории
func getDirSize(path string) int64 {
	var size int64

	// Рекурсивно обходим все файлы и поддиректории
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			// Для каждой директории добавляем 4096 байт (размер метаданных)
			if info.Name() != filepath.Base(path) {
				size += 4096
			}
		} else {
			// Для файлов добавляем их размер
			size += info.Size()
		}
		return nil
	})
	if err != nil {
		fmt.Println("ошибка при вычислении размера директории:", err)
		return 0
	}

	return size
}

// Функция для сортировки списка файлов и директорий
func sortFileList(fileList []FileInfo, sortType string) {
	/*функция sort.Slice упорядочивает наши файлы с директориями
	все происходит автоматически, от нас лишь требуется определить функцию сравнения*/
	sort.Slice(fileList, func(i, j int) bool {
		/*функция сравнения определяет, какой элемент должен идти первым в отсортированном списке
		сравнивая элементы при получении true ничего не поменяется - элементы стоят на своих законных местах
		при получении false функция sort.Slice поменяет элементы местами*/
		if sortType == "asc" {
			return fileList[i].Size < fileList[j].Size
		} else {
			return fileList[i].Size > fileList[j].Size
		}
	})
}

func convertSize(size int64) (float64, string) {
	floatSize := float64(size)
	counter := 0
	var value string
	for {
		if floatSize >= 1000 {
			floatSize = floatSize / 1000
			counter += 1
		} else {
			break
		}
	}
	switch counter {
	case 0:
		value = "байтов"
	case 1:
		value = "килобайтов"
	case 2:
		value = "мегабайтов"
	case 3:
		value = "гигабайтов"
	case 4:
		value = "терабайтов"
	}
	return floatSize, value
}
