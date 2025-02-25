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
          bindStatButton();
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
              bindStatButton();
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
          bindStatButton();
          history.pushState(null, '', '/');
      }).finally(() => {
        hideLoader();
        });
}
(window as any).gotoBegin = gotoBegin;

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
(window as any).showLoader = showLoader;

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
(window as any).hideLoader = hideLoader;

function bindStatButton() {
    const statButton = document.querySelector(".button__stats") as HTMLElement | null;
    if (statButton) {
        statButton.addEventListener("click", function (){
            window.location.href = "http://localhost/readstat.php";
        });
    }
}