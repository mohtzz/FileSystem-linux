<?php
// Конфигурационный файл

$servername = "localhost";
$username = "arseny";
$password = "qweqwe123!Q";
$dbname = "filesystem_stat";

$conn = null; // Инициализируем переменную соединения

try {
    // Создаем соединение
    $conn = new mysqli($servername, $username, $password);

    // Проверяем соединение
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Создаем базу данных, если она не существует
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    if ($conn->query($sql) !== TRUE) {
        throw new Exception("Error creating database: " . $conn->error);
    }

    // Выбираем базу данных
    $conn->select_db($dbname);

    // Создаем таблицу dir_stat, если она не существует
    $sql = "CREATE TABLE IF NOT EXISTS dir_stat (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        root VARCHAR(255) NOT NULL,
        size FLOAT NOT NULL,
        elapsedTime FLOAT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql) !== TRUE) {
        throw new Exception("Error creating table: " . $conn->error);
    }

} catch (Exception $e) {
    // Обработка исключений
    echo "Exception caught: " . $e->getMessage();
} finally {
    // Закрываем соединение
    if ($conn) {
        $conn->close();
    }
}
?>
