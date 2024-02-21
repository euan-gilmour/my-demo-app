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

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (() => {

eval("const searchBar = document.querySelector('#searchBar');\r\nconst getBtn = document.querySelector('#getBtn');\r\nconst responseArea = document.querySelector('#responseArea');\r\nlet appName;\r\nlet user;\r\nlet issuer;\r\nlet trusted_uri ='http://localhost:8081';\r\n\r\n//VP may be in the url parameters after redirecting from User to App\r\nlet params = new URLSearchParams(location.search);\r\n\r\ngetBtn.onclick = function () {\r\n  appName = \"my-demo-app\";\r\n  user = 'did:web:ben3101.solidcommunity.net';\r\n  issuer = 'did:web:issuer123.solidcommunity.net';\r\n\r\n  VcBasedrequests(); //Follows protocol. Initial request with VC headers, then request with VP\r\n};\r\n\r\n//---------------------------------------------------------------------------------------\r\nasync function VcBasedrequests(){\r\n  let url = searchBar.value;\r\n  //if we have a VP and just arrived from a redirect, use it to send a request for the resource\r\n  if(params.get(\"vp\")){\r\n    let VP = params.get(\"vp\");\r\n    console.log('Sending request for the resource with a VP...');\r\n    let resource = await requestWithVP(url, VP);\r\n    //wait 5 secs before updating the display\r\n    console.log(resource);\r\n    responseArea.innerHTML = resource;\r\n  //otherwise, send first request and follow protocol to acquire VP\r\n  }else{\r\n    console.log(\"Sending first request for the resource...\");\r\n    //message containing the app, issuer and user, requesting the resource at the url entered in the input box\r\n    let response = await fetch(url, {\r\n      method: \"POST\",\r\n      headers: {\r\n        'vc': 'true'//so the server's VcHttpHandler component handles it\r\n      },\r\n      body: JSON.stringify({\r\n        'user': user,\r\n        'app': appName,\r\n        'vcissuer': issuer,\r\n      })\r\n    });\r\n    let result = await response.json();\r\n    console.log(result);\r\n    console.log(response);\r\n    responseArea.innerHTML = JSON.stringify(result);\r\n    let VPrequest = result;\r\n\r\n    let nonce = undefined;\r\n    let domain = undefined;\r\n    try{\r\n      nonce = VPrequest.VerifiablePresentation.challenge;\r\n      domain = VPrequest.VerifiablePresentation.domain;\r\n    }catch(e){\r\n      console.log(\"No nonce or domain received in response\");\r\n      return;\r\n    }\r\n    //send request to User to acquire VP (after 5 secs)\r\n    window.setTimeout(()=>{\r\n      getVP(nonce, domain);\r\n    }, 1000);\r\n  }\r\n}\r\n\r\n//sends request to User app and asks for a VP\r\n//gets redirected to User HTML page and should return to App with VP\r\nasync function getVP(nonce, domain){\r\n  console.log(\"Sending request to the User app...\");\r\n  let url = 'http://localhost:8081/vprequest';\r\n  let response = await fetch(url, {\r\n    redirect: \"follow\",\r\n    method: \"POST\",\r\n    headers: {\r\n      \"Accept\": \"application/json\",\r\n      \"Content-Type\": \"application/json\"\r\n     },\r\n    body: JSON.stringify({\r\n      user: user,\r\n      application: appName,\r\n      vcissuer: issuer,\r\n      nonce: nonce,\r\n      domain: domain,\r\n      redirect_uri: window.location.href\r\n    })\r\n  });\r\n  if(response.url.substring(0,trusted_uri.length) === trusted_uri){\r\n    window.location = response.url;\r\n  }else{\r\n    console.log('Redirect URI not recognised.');\r\n    return;\r\n  }\r\n}\r\n\r\nasync function requestWithVP(url, vpJwt){  \r\n    let msg = {\r\n      method: \"GET\",\r\n      headers: {\r\n        'vp': vpJwt,\r\n        }\r\n      }\r\n    let response2 = await fetch(url, msg);\r\n    console.log(`Sent second request: ${JSON.stringify(msg)}`);\r\n    let res = response2.text();\r\n    return res;    \r\n}\r\n\n\n//# sourceURL=webpack://my-demo-app/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.js"]();
/******/ 	
/******/ })()
;