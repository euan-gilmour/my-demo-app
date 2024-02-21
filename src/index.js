const searchBar = document.querySelector('#searchBar');
const getBtn = document.querySelector('#getBtn');
const responseArea = document.querySelector('#responseArea');
let appName;
let user;
let issuer;
let trusted_uri ='http://localhost:8081';

//VP may be in the url parameters after redirecting from User to App
let params = new URLSearchParams(location.search);

getBtn.onclick = function () {
  appName = "my-demo-app";
  user = 'did:web:ben3101.solidcommunity.net';
  issuer = 'did:web:issuer123.solidcommunity.net';

  VcBasedrequests(); //Follows protocol. Initial request with VC headers, then request with VP
};

//---------------------------------------------------------------------------------------
async function VcBasedrequests(){
  let url = searchBar.value;
  //if we have a VP and just arrived from a redirect, use it to send a request for the resource
  if(params.get("vp")){
    let VP = params.get("vp");
    console.log('Sending request for the resource with a VP...');
    let resource = await requestWithVP(url, VP);
    //wait 5 secs before updating the display
    console.log(resource);
    responseArea.innerHTML = resource;
  //otherwise, send first request and follow protocol to acquire VP
  }else{
    console.log("Sending first request for the resource...");
    //message containing the app, issuer and user, requesting the resource at the url entered in the input box
    let response = await fetch(url, {
      method: "POST",
      headers: {
        'vc': 'true'//so the server's VcHttpHandler component handles it
      },
      body: JSON.stringify({
        'user': user,
        'app': appName,
        'vcissuer': issuer,
      })
    });
    let result = await response.json();
    console.log(result);
    console.log(response);
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
    //send request to User to acquire VP (after 5 secs)
    window.setTimeout(()=>{
      alert('Redirecting to User to get VP...');
      getVP(nonce, domain);
    }, 1000);
  }
}

//sends request to User app and asks for a VP
//gets redirected to User HTML page and should return to App with VP
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
  if(response.url.substring(0,trusted_uri.length) === trusted_uri){
    window.location = response.url;
  }else{
    console.log('Redirect URI not recognised.');
    return;
  }
}

async function requestWithVP(url, vpJwt){  
    let msg = {
      method: "GET",
      headers: {
        'vp': vpJwt,
        }
      }
    let response2 = await fetch(url, msg);
    console.log(`Sent second request: ${JSON.stringify(msg)}`);
    let res = response2.text();
    return res;    
}
