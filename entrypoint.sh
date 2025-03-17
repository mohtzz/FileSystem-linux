#!/bin/bash

# Установка зависимостей и сборка
npm install
tsc
npm run build

# Запуск Go-приложения
exec go run main.go