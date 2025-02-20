document.getElementById('directoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const params = new URLSearchParams(formData).toString();
    fetch('/?' + params, {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
});

function navigateTo(path) {
    const sortType = document.getElementById('sort').value;
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
}

function goBack() {
    const currentPath = document.querySelector('p').innerText.split(': ')[1];
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    const sortType = document.getElementById('sort').value;
    fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
}
function gotoBegin() {
    fetch('/?back=true', {
        method: 'GET'
    }).then(response => response.text())
      .then(html => {
          document.body.innerHTML = html;
          history.pushState(null, '', '/');
      });
}