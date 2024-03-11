const searchBar = document.querySelector('#searchBar');
const getBtn = document.querySelector('#getBtn');
const responseArea = document.querySelector('#responseArea');
let appName;
let user;
let issuer;

//VP may be in the URL parameters after redirecting from User to App
let params = new URLSearchParams(location.search);

getBtn.onclick = function () {
  appName = "my-demo-app";
  user = 'did:web:ben3101.solidcommunity.net';
  issuer = 'did:web:issuer123.solidcommunity.net';

  //Send requests following protocol
  VcBasedrequests(); 
  //Send requests following protocol - without user input and measure average time taken
  //speedTests(500);
};

async function VcBasedrequests(){
  let url = searchBar.value;
  //If we have a VP and just arrived from a redirect, use it to send a request for the resource from CSS server
  if(params.get("vp")){
    let VP = params.get("vp");
    console.log('Sending request for the resource with a VP...');
    let resource = await requestWithVP(url, VP);
    console.log(resource);
    responseArea.innerHTML = resource;
  //Otherwise, send first request and follow protocol to acquire VP
  }else{
    console.log("Sending first request for the resource...");
    //Message containing the app, issuer and user, requesting the resource at the url entered in the input box
    let response = await fetch(url, {
      method: "POST",
      headers: {
        'vc': 'true'//So the server's VcHttpHandler component handles it
      },
      body: JSON.stringify({
        'user': user,
        'app': appName,
        'vcissuer': issuer,
      })
    });
    let result = await response.json();
    console.log(result);
    responseArea.innerHTML = JSON.stringify(result);
    let VPrequest = result;

    let nonce = undefined;
    let domain = undefined;
    try{
      nonce = VPrequest.VerifiablePresentation.challenge;
      domain = VPrequest.VerifiablePresentation.domain;
    }catch(e){
      console.log("No nonce or domain received in response");
      return;
    }
    //Send request to User to acquire VP (after 1 second delay)
    window.setTimeout(()=>{
      alert('Redirecting to User to get VP...');
      getVP(nonce, domain);
    }, 1000);
  }
}

//Sends request to User app and ask for a VP
//Gets redirected to User HTML page and should return to App with VP
async function getVP(nonce, domain){
  console.log("Sending request to the User app...");
  let url = 'http://localhost:8081/vprequest';
  let response = await fetch(url, {
    redirect: "follow",
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
     },
    body: JSON.stringify({
      user: user,
      application: appName,
      vcissuer: issuer,
      nonce: nonce,
      domain: domain,
      redirect_uri: window.location.href
    })
  });
  if(response.url !== undefined){
    window.location = response.url;
  }else{
    console.log('Redirect URI not included in response.');
    return;
  }
}

async function requestWithVP(url, vpJwt){  
    let msg = {
      method: "GET",
      headers: {
        'vp': vpJwt,
        'Cache-Control': 'no-cache'
        }
      }
    let response2 = await fetch(url, msg);
    console.log(`Sent second request: ${JSON.stringify(msg)}`);
    let res = await response2.text();
    return res;    
}

//full protocol from start to finish
async function speedTest(){
  let startTime = performance.now();
  //console.log(`Start Time: ${startTime}`);

  let url = searchBar.value;
  //Send first request and follow protocol to acquire VP
  //console.log("Sending first request for the resource...");
  //Message containing the app, issuer and user, requesting the resource at the url entered in the input box
  let response = await fetch(url, {
      method: "POST",
      headers: {
        'vc': 'true'//So the server's VcHttpHandler component handles it
      },
      body: JSON.stringify({
        'user': user,
        'app': appName,
        'vcissuer': issuer,
      })
    });
    let result = await response.json();
    responseArea.innerHTML = JSON.stringify(result);
    let VPrequest = result;
    let nonce = undefined;
    let domain = undefined;
    try{
      nonce = VPrequest.VerifiablePresentation.challenge;
      domain = VPrequest.VerifiablePresentation.domain;
    }catch(e){
      console.log("No nonce or domain received in response");
      return;
    }
    //Send request to User to acquire VP
  console.log("Sending request to the User app...");
  let uri = 'http://localhost:8081/vprequest_speed_test';
  let res = await fetch(uri, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
     },
    body: JSON.stringify({
      user: user,
      application: appName,
      vcissuer: issuer,
      nonce: nonce,
      domain: domain,
    })
  });

    //Request resource with VP
    let VP = await res.text();
    //console.log(VP);
    //console.log('Sending request for the resource with a VP...');
    let resource = await requestWithVP(url, VP);
    //console.log(resource);
    responseArea.innerHTML = resource;
    let endTime = performance.now();
    //console.log(`End Time: ${endTime}`);
    let timeTaken = endTime - startTime;
    //console.log(`Time Taken: ${timeTaken} milliseconds`);
    return timeTaken;
}

async function speedTests(sampleSize){
  console.log(`Sending ${sampleSize} requests using VC-based protocol...`)
  let i = 1;
  let totalTime = 0;
  while(i<=sampleSize){
    console.log(`Request ${i}:`);
    totalTime += await speedTest();
    i++;
  }
  let averageTime = totalTime / sampleSize;
  console.log(`Average Time: ${averageTime}`);
}
