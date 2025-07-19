/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/lib/graphql.js":
/*!****************************!*\
  !*** ./src/lib/graphql.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @apollo/client */ \"@apollo/client\");\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_apollo_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst httpLink = (0,_apollo_client__WEBPACK_IMPORTED_MODULE_0__.createHttpLink)({\n    uri: \"http://localhost:8080/graphql\",\n    headers: {\n        \"Content-Type\": \"application/json\"\n    },\n    fetchOptions: {\n        mode: \"cors\"\n    }\n});\nconst client = new _apollo_client__WEBPACK_IMPORTED_MODULE_0__.ApolloClient({\n    link: httpLink,\n    cache: new _apollo_client__WEBPACK_IMPORTED_MODULE_0__.InMemoryCache({\n        typePolicies: {\n            Query: {\n                fields: {\n                    getGame: {\n                        // Always refetch from network for AI games\n                        fetchPolicy: \"network-only\"\n                    },\n                    isAITurn: {\n                        // Always refetch from network\n                        fetchPolicy: \"network-only\"\n                    }\n                }\n            }\n        }\n    }),\n    defaultOptions: {\n        watchQuery: {\n            errorPolicy: \"all\",\n            fetchPolicy: \"cache-and-network\"\n        },\n        query: {\n            errorPolicy: \"all\",\n            fetchPolicy: \"cache-and-network\"\n        }\n    }\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (client);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGliL2dyYXBocWwuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZFO0FBRTdFLE1BQU1HLFdBQVdELDhEQUFjQSxDQUFDO0lBQzlCRSxLQUFLO0lBQ0xDLFNBQVM7UUFDUCxnQkFBZ0I7SUFDbEI7SUFDQUMsY0FBYztRQUNaQyxNQUFNO0lBQ1I7QUFDRjtBQUVBLE1BQU1DLFNBQVMsSUFBSVIsd0RBQVlBLENBQUM7SUFDOUJTLE1BQU1OO0lBQ05PLE9BQU8sSUFBSVQseURBQWFBLENBQUM7UUFDdkJVLGNBQWM7WUFDWkMsT0FBTztnQkFDTEMsUUFBUTtvQkFDTkMsU0FBUzt3QkFDUCwyQ0FBMkM7d0JBQzNDQyxhQUFhO29CQUNmO29CQUNBQyxVQUFVO3dCQUNSLDhCQUE4Qjt3QkFDOUJELGFBQWE7b0JBQ2Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7SUFDQUUsZ0JBQWdCO1FBQ2RDLFlBQVk7WUFDVkMsYUFBYTtZQUNiSixhQUFhO1FBQ2Y7UUFDQUssT0FBTztZQUNMRCxhQUFhO1lBQ2JKLGFBQWE7UUFDZjtJQUNGO0FBQ0Y7QUFFQSxpRUFBZVAsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXNzLWZyb250ZW5kLy4vc3JjL2xpYi9ncmFwaHFsLmpzPzJiODMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBvbGxvQ2xpZW50LCBJbk1lbW9yeUNhY2hlLCBjcmVhdGVIdHRwTGluayB9IGZyb20gJ0BhcG9sbG8vY2xpZW50JztcblxuY29uc3QgaHR0cExpbmsgPSBjcmVhdGVIdHRwTGluayh7XG4gIHVyaTogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9ncmFwaHFsJyxcbiAgaGVhZGVyczoge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gIH0sXG4gIGZldGNoT3B0aW9uczoge1xuICAgIG1vZGU6ICdjb3JzJyxcbiAgfSxcbn0pO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgQXBvbGxvQ2xpZW50KHtcbiAgbGluazogaHR0cExpbmssXG4gIGNhY2hlOiBuZXcgSW5NZW1vcnlDYWNoZSh7XG4gICAgdHlwZVBvbGljaWVzOiB7XG4gICAgICBRdWVyeToge1xuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBnZXRHYW1lOiB7XG4gICAgICAgICAgICAvLyBBbHdheXMgcmVmZXRjaCBmcm9tIG5ldHdvcmsgZm9yIEFJIGdhbWVzXG4gICAgICAgICAgICBmZXRjaFBvbGljeTogJ25ldHdvcmstb25seScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpc0FJVHVybjoge1xuICAgICAgICAgICAgLy8gQWx3YXlzIHJlZmV0Y2ggZnJvbSBuZXR3b3JrXG4gICAgICAgICAgICBmZXRjaFBvbGljeTogJ25ldHdvcmstb25seScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSksXG4gIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgd2F0Y2hRdWVyeToge1xuICAgICAgZXJyb3JQb2xpY3k6ICdhbGwnLFxuICAgICAgZmV0Y2hQb2xpY3k6ICdjYWNoZS1hbmQtbmV0d29yaycsIC8vIEFsd2F5cyB0cnkgdG8gZ2V0IGZyZXNoIGRhdGFcbiAgICB9LFxuICAgIHF1ZXJ5OiB7XG4gICAgICBlcnJvclBvbGljeTogJ2FsbCcsXG4gICAgICBmZXRjaFBvbGljeTogJ2NhY2hlLWFuZC1uZXR3b3JrJyxcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsaWVudDsiXSwibmFtZXMiOlsiQXBvbGxvQ2xpZW50IiwiSW5NZW1vcnlDYWNoZSIsImNyZWF0ZUh0dHBMaW5rIiwiaHR0cExpbmsiLCJ1cmkiLCJoZWFkZXJzIiwiZmV0Y2hPcHRpb25zIiwibW9kZSIsImNsaWVudCIsImxpbmsiLCJjYWNoZSIsInR5cGVQb2xpY2llcyIsIlF1ZXJ5IiwiZmllbGRzIiwiZ2V0R2FtZSIsImZldGNoUG9saWN5IiwiaXNBSVR1cm4iLCJkZWZhdWx0T3B0aW9ucyIsIndhdGNoUXVlcnkiLCJlcnJvclBvbGljeSIsInF1ZXJ5Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/lib/graphql.js\n");

/***/ }),

/***/ "./src/pages/_app.js":
/*!***************************!*\
  !*** ./src/pages/_app.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @apollo/client */ \"@apollo/client\");\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_apollo_client__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_graphql__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/graphql */ \"./src/lib/graphql.js\");\n/* harmony import */ var _styles_chess_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/chess.css */ \"./src/styles/chess.css\");\n/* harmony import */ var _styles_chess_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_chess_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_apollo_client__WEBPACK_IMPORTED_MODULE_1__.ApolloProvider, {\n        client: _lib_graphql__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Harry Miller\\\\chess-game\\\\frontend\\\\src\\\\pages\\\\_app.js\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Harry Miller\\\\chess-game\\\\frontend\\\\src\\\\pages\\\\_app.js\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBZ0Q7QUFDWjtBQUNQO0FBRWQsU0FBU0UsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNsRCxxQkFDRSw4REFBQ0osMERBQWNBO1FBQUNDLFFBQVFBLG9EQUFNQTtrQkFDNUIsNEVBQUNFO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGVzcy1mcm9udGVuZC8uL3NyYy9wYWdlcy9fYXBwLmpzPzhmZGEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBvbGxvUHJvdmlkZXIgfSBmcm9tICdAYXBvbGxvL2NsaWVudCc7XG5pbXBvcnQgY2xpZW50IGZyb20gJy4uL2xpYi9ncmFwaHFsJztcbmltcG9ydCAnLi4vc3R5bGVzL2NoZXNzLmNzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8QXBvbGxvUHJvdmlkZXIgY2xpZW50PXtjbGllbnR9PlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgIDwvQXBvbGxvUHJvdmlkZXI+XG4gICk7XG59XHJcbiJdLCJuYW1lcyI6WyJBcG9sbG9Qcm92aWRlciIsImNsaWVudCIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.js\n");

/***/ }),

/***/ "./src/styles/chess.css":
/*!******************************!*\
  !*** ./src/styles/chess.css ***!
  \******************************/
/***/ (() => {



/***/ }),

/***/ "@apollo/client":
/*!*********************************!*\
  !*** external "@apollo/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@apollo/client");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/_app.js"));
module.exports = __webpack_exports__;

})();