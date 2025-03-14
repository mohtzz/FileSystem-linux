<?php
require 'init.php';

$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    http_response_code(500); // Устанавливаем код ответа 500
    echo json_encode(["error" => "Ошибка подключения к базе данных: " . $conn->connect_error]);
    exit();
}

$sql = "SELECT id, root, size, elapsedTime, date FROM dir_stat";
$result = $conn->query($sql);

// Проверка выполнения запроса
if (!$result) {
    http_response_code(500); // Устанавливаем код ответа 500
    echo json_encode(["error" => "Ошибка выполнения запроса: " . $conn->error]);
    $conn->close();
    exit();
}

$stats = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $stats[] = $row;
    }
} else {
    // Если нет данных, можно вернуть пустой массив или сообщение
    $stats = [];
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статистика</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
    }
    canvas {
        width: 100%;
        max-width: 900px;
        margin: 20px auto;
        background-color: #eaeaea; 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #ddd;
    }
    th {
        background-color: #3498db;
        color: white;
        font-weight: bold;
    }
    td {
        background-color: #ffffff; 
        transition: background-color 0.3s;
    }
    td:hover {
        background-color: #f1f1f1;
    }
    .back-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            background-color: #3498db;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
        }
    .back-button:hover {
        background-color: #2980b9;
    }
</style>
</head>
<body>
    <h1 class="title">Статистика</h1>
    <button class="back-button">Назад</button>
    <canvas id="myChart" width="400" height="200"></canvas>
    <table class="table">
        <thead>
            <tr class="table__row">
                <th class="table__header">ID</th>
                <th class="table__header">Путь к директории</th>
                <th class="table__header">Размер</th>
                <th class="table__header">Время выполнения</th>
                <th class="table__header">Дата</th>
            </tr>
        </thead>
        <tbody id="statsTableBody">
            <?php foreach ($stats as $item): ?>
                <tr class="table__row">
                    <td><?= $item['id'] ?></td>
                    <td><?= htmlspecialchars($item['root']) ?></td>
                    <td><?= $item['size'] ?></td>
                    <td><?= $item['elapsedTime'] ?></td>
                    <td><?= $item['date'] ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const backButton = document.querySelector('.back-button');
            backButton.addEventListener('click', function() {
                window.history.back();
            });
            const sizes = [];
            const elapsedTimes = [];
            const rows = document.querySelectorAll('#statsTableBody tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                sizes.push(cells[2].innerText);
                elapsedTimes.push(cells[3].innerText); 
            });

            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sizes,
                    datasets: [{
                        label: 'Время выполнения (сек)',
                        data: elapsedTimes,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Размер директории'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Время выполнения (сек)'
                            }
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>
