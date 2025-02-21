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
          history.pushState(null, '', '/');
      }).finally(() => {
          hideLoader();
        });
});

function navigateTo(path: string): void {
    const sortType = (document.getElementById('sort') as HTMLSelectElement).value;
    showLoader();
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      }).finally(() => {
        hideLoader();
        });
}
(window as any).navigateTo = navigateTo;

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
              history.pushState(null, '', '/');
          }).finally(() => {
            hideLoader();
            });
    }
}
(window as any).goBack = goBack;

function gotoBegin(): void {
    showLoader();
    fetch('/?back=true', {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      }).finally(() => {
        hideLoader();
        });
}
(window as any).gotoBegin = gotoBegin;

function showLoader(): void {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}
(window as any).showLoader = showLoader;

function hideLoader(): void {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none'; // Скрыть индикатор загрузки
    }
}
(window as any).hideLoader = hideLoader;