<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$root = $data['root'];
$size = $data['size'];
$elapsedTime = $data['elapsedTime'];

$servername = "localhost";
$username = "arseny";
$password = "qweqwe123!Q";
$dbname = "filesystem_stat";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("INSERT INTO dir_stat (root, size, elapsedTime) VALUES (?, ?, ?)");
$stmt->bind_param("sds", $root, $size, $elapsedTime);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>