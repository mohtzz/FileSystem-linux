/******/ (() => { // webpackBootstrap
/*!******************************!*\
  !*** ./web/static/script.js ***!
  \******************************/
var _a;
(_a = document.getElementById('directoryForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(this);
    var params = new URLSearchParams(formData).toString();
    fetch('/?' + params, {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    });
});
window.navigateTo = function(path) {
    var sortType = document.getElementById('sort').value;
    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    });
}
window.goBack = function() {
    var _a;
    var currentPath = (_a = document.querySelector('p')) === null || _a === void 0 ? void 0 : _a.innerText.split(': ')[1];
    if (currentPath) {
        var parentPath = currentPath.split('/').slice(0, -1).join('/');
        var sortType = document.getElementById('sort').value;
        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {
            method: 'GET'
        }).then(function (response) { return response.text(); })
            .then(function (html) {
            document.body.innerHTML = html;
            history.pushState(null, '', '/');
        });
    }
}
window.gotoBegin = function() {
    fetch('/?back=true', {
        method: 'GET'
    }).then(function (response) { return response.text(); })
        .then(function (html) {
        document.body.innerHTML = html;
        history.pushState(null, '', '/');
    });
}
//# sourceMappingURL=script.js.map
/******/ })()
;
//# sourceMappingURL=bundle.js.map