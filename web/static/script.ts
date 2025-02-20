document.getElementById('directoryForm')?.addEventListener('submit', function(event: Event) {
    event.preventDefault();
    const formData = new FormData(this as HTMLFormElement);
    const params = new URLSearchParams(formData as any).toString();
    fetch('/?' + params, {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
});

function navigateTo(path: string): void {
    const sortType = (document.getElementById('sort') as HTMLSelectElement).value;
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
}

function goBack(): void {
    const currentPath = document.querySelector('p')?.innerText.split(': ')[1];
    if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        const sortType = (document.getElementById('sort') as HTMLSelectElement).value;
        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
            method: 'GET'
        }).then(response => response.text())
          .then(html => {
              document.body.innerHTML = html;
              history.pushState(null, '', '/');
          });
    }
}

function gotoBegin(): void {
    fetch('/?back=true', {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
}