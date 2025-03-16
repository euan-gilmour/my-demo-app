let QRCode = require("qrcode");

const searchBar = document.querySelector("#searchBar");
const getBtn = document.querySelector("#getBtn");
const responseArea = document.querySelector("#responseArea");
const qrCanvas = document.querySelector("#qrCanvas");
const ipAddressField = document.querySelector("#ipAddressField");
const userDidField = document.querySelector("#userDidField");
const appName = "my-demo-app";
const issuer =
  "did:web:raw.githubusercontent.com:euan-gilmour:dids:main:issuer";
let url;
let user;

getBtn.onclick = function () {
  initialVcRequest();
};

async function initialVcRequest() {
  url = searchBar.value;
  user = userDidField.value;

  console.log("Sending first request for the resource...");
  let response = await fetch(url, {
    method: "POST",
    headers: {
      vc: "true", //So the server's VcHttpHandler component handles it
    },
    body: JSON.stringify({
      user: user,
      app: appName,
      vcissuer: issuer,
    }),
  });
  let result = await response.json();
  console.log(result);

  responseArea.innerHTML = JSON.stringify(result);
  let VPrequest = result;

  let nonce = undefined;
  let domain = undefined;
  try {
    nonce = VPrequest.VerifiablePresentation.challenge;
    domain = VPrequest.VerifiablePresentation.domain;
  } catch (e) {
    console.log("No nonce or domain received in response");
    return;
  }

  setupWebSocket();
  generateVpRequestAsQr(nonce, domain);
}

function generateVpRequestAsQr(nonce, domain) {
  const localIp = ipAddressField.value;

  const vpRequest = {
    user: user,
    application: appName,
    vcissuer: issuer,
    nonce: nonce,
    domain: domain,
    signallingChannelUrl: `ws://${localIp}:8081/`,
  };

  console.log(vpRequest);

  vpRequestString = JSON.stringify(vpRequest);

  // Create the QR code
  QRCode.toCanvas(qrCanvas, vpRequestString, (err) => {
    if (err) console.log(err);
    else console.log("QR Code Successful");
  });
}

function setupWebSocket() {
  const ws = new WebSocket("ws://localhost:8081/");

  getBtn.addEventListener("click", () => {
    ws.close();
  });

  window.addEventListener("beforeunload", () => {
    ws.close();
    peerConnection.close();
  });

  ws.onopen = () => {
    console.log("WebSocket connection opened");
  };

  ws.onmessage = (event) => {
    console.log("Recieved: ", event.data);
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "VP":
        sendRequestWithVP(message.vp);
        ws.close();
    }
  };
}

function sendRequestWithVP(vpJwt) {
  let msg = {
    method: "GET",
    headers: {
      vp: vpJwt,
      "Cache-Control": "no-cache",
    },
  };
  fetch(url, msg)
    .then((response) => response.text())
    .then((res) => (responseArea.innerHTML = res));
}
