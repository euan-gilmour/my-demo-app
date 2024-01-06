import { createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } from 'did-jwt-vc'
import { ES256KSigner, hexToBytes } from 'did-jwt';

const searchBar = document.querySelector('#searchBar');
const getBtn = document.querySelector('#getBtn');
const responseArea = document.querySelector('#responseArea');

//----------------------------------------------------------------------------------------------------------

let appName;
let user;
let issuer;

//Example VC/VP code----------------------------
async function createVP(nonce, domain, user, issuer, appName){
  // Create a signer by using a private key (hex).
  //ben3101 key
  //const VcIssuerKey = 'a17cb543a7fbf5493a9754c977826925a346964c5b292e9da31bb6940f698313';
  //issuer123 key
  const VcIssuerKey = '2143c4bd995378ce36bacfcfda2e39610f2809e349b4d25e7b7d2b5f1d82e6ae';
  const VcSigner = ES256KSigner(hexToBytes(VcIssuerKey))

  // Prepare an issuer (of VC)
  const vcIssuer = {
      did: issuer,
      signer: VcSigner
  }

  //Create a VC:
  //use today's date for issuance
  let today = Math.ceil((Date.now() / 1000));
  let tenYearsFromNow = today + 315569260;

  //test dates for expired VC, make issuance 10 years ago and expiry yesterday
  // tenYearsFromNow = today - 86400;
  // today = today - 315569260;
  //-payload
  const vcPayload = {
    sub: user,
    //nbf: 1562950282,
    nbf: today,
    exp: tenYearsFromNow,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      credentialSubject: {
        degree: {
          type: "BachelorDegree",
          name: "Bachelor of Science"
        }
      }
    }
  }
  //-convert VC to JWT
  const vcJwt = await createVerifiableCredentialJwt(vcPayload, vcIssuer);

  //Create a VP:
  //the VC holder will sign the VP
  //ben3101 key
  const VpSignerKey = 'a17cb543a7fbf5493a9754c977826925a346964c5b292e9da31bb6940f698313';
  //issuer123 key
  //const VpSignerKey = '2143c4bd995378ce36bacfcfda2e39610f2809e349b4d25e7b7d2b5f1d82e6ae';
  const VpSigner = ES256KSigner(hexToBytes(VpSignerKey))
  const holder = {
    did: user,
    signer: VpSigner
}

  //-VP payload
  const vpPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vcJwt],
      nonce: nonce,
      domain: domain,
      appName: appName
    }
  }
  const vpJwt = await createVerifiablePresentationJwt(vpPayload, holder);
  return vpJwt;
}

//Requests--------------------------------------------
getBtn.onclick = function () {
  appName = "my-demo-app";
  user = 'did:web:ben3101.solidcommunity.net';
  issuer = 'did:web:issuer123.solidcommunity.net';

  VcBasedrequests(); //follows protocol. Initial request with VC headers, then request with VP
  //request2(); //test request to look at responses in oidc flow
  //testRequest(); //just a GET request with no attempt to authenticate
};

async function testRequest(){
  console.log('Try get resource with no prior authentication');
  let url = searchBar.value;
  let response = await fetch(url, {
    method: "GET"
  });

  let result = await response.text();
  console.log(result);
  console.log(response);
  responseArea.innerHTML = result;
}

async function request2(){
  console.log('1 - Discover Authorisation Server');
  //??
  console.log('2 - Request AS configuration')
  //http://localhost:3000/.well-known/openid-configuration
  let url = searchBar.value;
  let response = await fetch(url, {
    method: "GET"
  });

  let result = await response.json();
  console.log(result);
  console.log(response);
  responseArea.innerHTML = JSON.stringify(result);
}
//---------------------------------------------------------------------------------------
async function VcBasedrequests(){
  console.log("Sending first request for the resource...");
  //message containing the app, issuer and user, requesting the resource at the url entered in the input box
  let url = searchBar.value;
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


  let resource = await requestWithVP(nonce, domain, url);

  //wait 5 secs before updating the display
  console.log(resource);
  window.setTimeout(()=>{
    responseArea.innerHTML = resource;
  }, 5000);
}

async function requestWithVP(nonce, domain, url){
  //the response from the server should be a VP request
  //if second response received with nonce, send them inside the VP
  //create a VC, include it inside the VP
  //send the VP inside the header of the GET request
  
  if(nonce !== undefined && domain !== undefined){
    let vpJwt = await createVP(nonce, domain, user, issuer, appName);
    let msg = {
      method: "GET",
      headers: {
        //'Authorization': 'VP',
        'vp': vpJwt,
        }
      }
    let response2 = await fetch(url, msg);
    console.log(`Sent second request: ${JSON.stringify(msg)}`);
    let res = response2.text();
    return res;
    }else{
      console.log("Could not send second request.")
    }
}
