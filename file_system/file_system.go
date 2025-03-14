package filesystem

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"sync"
)

// FileInfo - структура для хранения информации о файле/директории.
type FileInfo struct {
	Name  string  // Name - имя файла.
	Size  float64 // Size - размер файла.
	Unit  string  // Unit - поле для хранения системы счисления размера.
	IsDir bool    // IsDir - является ли директорией.
	Path  string  // Path - поле для перезаписи пути.
}

// ListDirByReadDir - функция для обхода директории и сбора информации.
func ListDirByReadDir(path string) ([]FileInfo, error) {
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
				size := GetDirSize(newPath)
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

// GetDirSize - функция для вычисления размера директории.
func GetDirSize(path string) float64 {
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

// SortFileList - функция для сортировки списка файлов и директорий.
func SortFileList(fileList []FileInfo, sortType string) {
	sort.Slice(fileList, func(i, j int) bool {
		if sortType == "asc" {
			return fileList[i].Size < fileList[j].Size
		} else {
			return fileList[i].Size > fileList[j].Size
		}
	})
}

// ConvertSize - функция для перевода размера в байтах в кб/мб/гб/тб
func ConvertSize(size float64) (float64, string) {
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
