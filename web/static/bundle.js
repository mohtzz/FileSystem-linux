/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./web/static/script.js":
/*!******************************!*\
  !*** ./web/static/script.js ***!
  \******************************/
/***/ (() => {

eval("var _a;\n(_a = document.getElementById('directoryForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {\n    event.preventDefault();\n    var formData = new FormData(this);\n    var params = new URLSearchParams(formData).toString();\n    showLoader();\n    fetch('/?' + params, {\n        method: 'GET'\n    }).then(function (response) { return response.text(); })\n        .then(function (html) {\n        document.body.innerHTML = html;\n        history.pushState(null, '', '/');\n    }).finally(function () {\n        hideLoader();\n    });\n});\nfunction navigateTo(path) {\n    var sortType = document.getElementById('sort').value;\n    showLoader();\n    fetch('/?root=' + encodeURIComponent(path) + '&sort=' + encodeURIComponent(sortType), {\n        method: 'GET'\n    }).then(function (response) { return response.text(); })\n        .then(function (html) {\n        document.body.innerHTML = html;\n        history.pushState(null, '', '/');\n    }).finally(function () {\n        hideLoader();\n    });\n}\nwindow.navigateTo = navigateTo;\nfunction goBack() {\n    var _a;\n    var currentPath = (_a = document.querySelector('p')) === null || _a === void 0 ? void 0 : _a.innerText.split(': ')[1];\n    if (currentPath) {\n        var parentPath = currentPath.split('/').slice(0, -1).join('/');\n        var sortType = document.getElementById('sort').value;\n        showLoader();\n        fetch('/?root=' + encodeURIComponent(parentPath) + '&sort=' + encodeURIComponent(sortType), {\n            method: 'GET'\n        }).then(function (response) { return response.text(); })\n            .then(function (html) {\n            document.body.innerHTML = html;\n            history.pushState(null, '', '/');\n        }).finally(function () {\n            hideLoader();\n        });\n    }\n}\nwindow.goBack = goBack;\nfunction gotoBegin() {\n    showLoader();\n    fetch('/?back=true', {\n        method: 'GET'\n    }).then(function (response) { return response.text(); })\n        .then(function (html) {\n        document.body.innerHTML = html;\n        history.pushState(null, '', '/');\n    }).finally(function () {\n        hideLoader();\n    });\n}\nwindow.gotoBegin = gotoBegin;\nfunction showLoader() {\n    var loader = document.getElementById('loader');\n    if (loader) {\n        loader.style.display = 'block';\n    }\n}\nwindow.showLoader = showLoader;\nfunction hideLoader() {\n    var loader = document.getElementById('loader');\n    if (loader) {\n        loader.style.display = 'none'; // Скрыть индикатор загрузки\n    }\n}\nwindow.hideLoader = hideLoader;\n\n\n//# sourceURL=webpack://filesystem/./web/static/script.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./web/static/script.js"]();
/******/ 	
/******/ })()
;