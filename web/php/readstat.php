<?php
header('Content-Type: text/html');

$servername = "localhost";
$username = "arseny";
$password = "qweqwe123!Q";
$dbname = "filesystem_stat";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM dir_stat ORDER BY date DESC";
$result = $conn->query($sql);

$data = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
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
    <link rel="stylesheet" href="/web/static/style.css">
</head>
<body class="body">
    <h1 class="title">Статистика</h1>
    <div class="chart-container">
        <canvas id="myChart"></canvas>
    </div>
    <table class="table">
        <thead>
            <tr class="table__row">
                <th class="table__header">ID</th>
                <th class="table__header">Путь</th>
                <th class="table__header">Размер</th>
                <th class="table__header">Затраченное время</th>
                <th class="table__header">Дата</th>
            </tr>
        </thead>
        <tbody id="statsTableBody">
            <?php foreach ($data as $item): ?>
                <tr class="table__row">
                    <td class="table__cell"><?php echo $item['id']; ?></td>
                    <td class="table__cell"><?php echo $item['root']; ?></td>
                    <td class="table__cell"><?php echo $item['size']; ?></td>
                    <td class="table__cell"><?php echo $item['elapsedTime']; ?></td>
                    <td class="table__cell"><?php echo $item['date']; ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <script>
        const data = <?php echo json_encode($data); ?>;

        const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.size),
                datasets: [{
                    label: 'Затраченное время',
                    data: data.map(item => parseFloat(item.elapsedTime)),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>