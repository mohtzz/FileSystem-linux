bindStatButton();

document.getElementById('directoryForm')?.addEventListener('submit', function(event: Event) {
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
          history.pushState(null, '', '/');
      }).finally(() => {
          hideLoader();
        });
});

function bindNavigationLinks() {
    const links = document.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('click', function(event: Event) {
            event.preventDefault();
            const path = (event.target as HTMLElement).getAttribute('data-path');
            if (path) {
                navigateTo(path);
            }
        });
    });
}

function bindBackButton() {
    const backButton = document.querySelector('.button__back');
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
}

function navigateTo(path: string): void {
    const sortType = (document.getElementById('sort') as HTMLSelectElement).value;
    showLoader();
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          bindStatButton();
          bindNavigationLinks();
          bindBackButton();
          history.pushState(null, '', '/');
      }).finally(() => {
        hideLoader();
        });
}

function goBack(): void {
    const currentPath = document.querySelector('p')?.innerText.split(': ')[1];
    if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        const sortType = (document.getElementById('sort') as HTMLSelectElement).value;
        showLoader();
        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
            method: 'GET'
        }).then(response => response.text())
          .then(html => {
              document.body.innerHTML = html;
              bindStatButton();
              bindNavigationLinks();
              bindBackButton();
              history.pushState(null, '', '/');
          }).finally(() => {
            hideLoader();
            });
    }
}

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

function bindStatButton() {
    const statButton = document.querySelector(".button__stats") as HTMLElement | null;
    if (statButton) {
        statButton.addEventListener("click", function (){
            window.location.href = "http://localhost/readstat.php";
        });
    }
}

// Инициализация обработчиков при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    bindStatButton();
    bindNavigationLinks();
    bindBackButton();
});