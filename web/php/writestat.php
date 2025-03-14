<?php
require 'init.php';

$data = json_decode(file_get_contents('php://input'), true);

error_log(print_r($data, true));

$root = $data['root'];
$size = $data['size'];
$elapsedTime = $data['elapsedTime'];

// Подключение к базе данных
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    http_response_code(500); // Устанавливаем код ответа сервера 500
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

// Подготовка запроса
$stmt = $conn->prepare("INSERT INTO dir_stat (root, size, elapsedTime) VALUES (?, ?, ?)");
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare statement."]);
    $conn->close();
    exit();
}

// Привязка параметров
if (!$stmt->bind_param("sds", $root, $size, $elapsedTime)) {
    error_log("Bind param failed: " . $stmt->error);
    http_response_code(500);
    echo json_encode(["error" => "Failed to bind parameters."]);
    $stmt->close();
    $conn->close();
    exit();
}

// Выполнение запроса
if (!$stmt->execute()) {
    error_log("Execute failed: " . $stmt->error);
    http_response_code(500);
    echo json_encode(["error" => "Failed to execute statement."]);
} else {
    http_response_code(200); // Успешное выполнение
    echo json_encode(["success" => "Data inserted successfully."]);
}

// Закрытие подготовленного выражения и соединения
$stmt->close();
$conn->close();
?>
