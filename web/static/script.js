var _a;
(_a = document.getElementById('directoryForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(this);
    var params = new URLSearchParams(formData).toString();
    showLoader();
    fetch('/?' + params, {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    }).finally(function () {
        hideLoader();
    });
});
function navigateTo(path) {
    var sortType = document.getElementById('sort').value;
    showLoader();
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    }).finally(function () {
        hideLoader();
    });
}
window.navigateTo = navigateTo;
function goBack() {
    var _a;
    var currentPath = (_a = document.querySelector('p')) === null || _a === void 0 ? void 0 : _a.innerText.split(': ')[1];
    if (currentPath) {
        var parentPath = currentPath.split('/').slice(0, -1).join('/');
        var sortType = document.getElementById('sort').value;
        showLoader();
        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
            method: 'GET'
        }).then(function (response) { return response.text(); })
            .then(function (html) {
            document.body.innerHTML = html;
            history.pushState(null, '', '/');
        }).finally(function () {
            hideLoader();
        });
    }
}
window.goBack = goBack;
function gotoBegin() {
    showLoader();
    fetch('/?back=true', {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    }).finally(function () {
        hideLoader();
    });
}
window.gotoBegin = gotoBegin;
function showLoader() {
    var loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}
window.showLoader = showLoader;
function hideLoader() {
    var loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none'; // Скрыть индикатор загрузки
    }
}
window.hideLoader = hideLoader;
