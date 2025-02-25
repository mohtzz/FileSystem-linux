document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost/readstat.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('statsTableBody');
            const sizes = [];
            const elapsedTimes = [];

            data.forEach(stat => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__cell">${stat.id}</td>
                    <td class="table__cell">${stat.root}</td>
                    <td class="table__cell">${stat.size}</td>
                    <td class="table__cell">${stat.elapsedTime}</td>
                    <td class="table__cell">${stat.date}</td>
                `;
                tableBody.appendChild(row);

                sizes.push(stat.size);
                elapsedTimes.push(parseFloat(stat.elapsedTime));
            });

            const ctx = document.getElementById('statsChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sizes,
                    datasets: [{
                        label: 'Время выполнения',
                        data: elapsedTimes,
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
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Произошла ошибка при загрузке данных. Проверьте консоль для подробностей.');
        });
});