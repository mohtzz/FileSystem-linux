// Функция для привязки кнопки статистики
function bindStatButton() {
    const statButton = document.querySelector(".button__stats") as HTMLElement | null;
    if (statButton) {
        statButton.addEventListener("click", function () {
            window.location.href = "http://localhost:8080/readstat.php";
        });
    }
}

// Функция для привязки обработчика изменения сортировки
function bindSortSelect() {
    const sortSelect = document.getElementById('sort') as HTMLSelectElement | null;
    if (sortSelect) {
        // Восстанавливаем значение из localStorage
        const savedSortType = localStorage.getItem('sortType');
        if (savedSortType) {
            sortSelect.value = savedSortType;
        }

        // Сохраняем значение в localStorage при изменении
        sortSelect.addEventListener('change', function () {
            localStorage.setItem('sortType', sortSelect.value);
            console.log('Sort type saved:', sortSelect.value); // Отладка
        });
    }
}

// Функция для отправки формы
document.getElementById('directoryForm')?.addEventListener('submit', function (event: Event) {
    event.preventDefault();
    const formData = new FormData(this as HTMLFormElement);
    const params = new URLSearchParams(formData as any).toString();
    showLoader();
    fetch('/?' + params, {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          bindStatButton();
          bindNavigationLinks();
          bindBackButton();
          bindSortSelect(); // Восстанавливаем выбор сортировки
          history.pushState(null, '', '/');
      }).finally(() => {
          hideLoader();
      });
});

// Функция для привязки ссылок навигации
function bindNavigationLinks() {
    const links = document.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('click', function (event: Event) {
            event.preventDefault();
            const path = (event.target as HTMLElement).getAttribute('data-path');
            if (path) {
                navigateTo(path);
            }
        });
    });
}

// Функция для привязки кнопки "Назад"
function bindBackButton() {
    const backButton = document.querySelector('.button__back');
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
}

// Функция для навигации по пути
function navigateTo(path: string): void {
    const sortType = localStorage.getItem('sortType') || 'asc'; // Используем сохраненное значение или значение по умолчанию
    console.log('Navigating to:', path, 'with sort type:', sortType); // Отладка
    showLoader();
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          bindStatButton();
          bindNavigationLinks();
          bindBackButton();
          bindSortSelect(); // Восстанавливаем выбор сортировки
          history.pushState(null, '', '/');
      }).finally(() => {
          hideLoader();
      });
}

// Функция для возврата на предыдущую директорию
function goBack(): void {
    const currentPath = document.querySelector('p')?.innerText.split(': ')[1];
    if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        const sortType = localStorage.getItem('sortType') || 'asc'; // Используем сохраненное значение или значение по умолчанию
        console.log('Going back to:', parentPath, 'with sort type:', sortType); // Отладка
        showLoader();
        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
            method: 'GET'
        }).then(response => response.text())
          .then(html => {
              document.body.innerHTML = html;
              bindStatButton();
              bindNavigationLinks();
              bindBackButton();
              bindSortSelect(); // Восстанавливаем выбор сортировки
              history.pushState(null, '', '/');
          }).finally(() => {
              hideLoader();
          });
    }
}

// Функция для показа загрузчика
function showLoader(): void {
    const elements = document.querySelectorAll('button, a, input, select, textarea');
    elements.forEach(element => {
        (element as HTMLElement).classList.add('disabled');
        (element as HTMLButtonElement).disabled = true;
    });
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

// Функция для скрытия загрузчика
function hideLoader(): void {
    const elements = document.querySelectorAll('button, a, input, select, textarea');
    elements.forEach(element => {
        (element as HTMLElement).classList.remove('disabled');
        (element as HTMLButtonElement).disabled = false;
    });
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Инициализация обработчиков при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    bindStatButton();
    bindNavigationLinks();
    bindBackButton();
    bindSortSelect(); // Инициализация обработчика изменения сортировки
});