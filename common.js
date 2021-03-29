function chatlog(msg) {
  var words = msg.split(',');
  opponentPosition = new BABYLON.Vector3(words[0], words[1], words[2]);
  console.log(opponentPosition)
}

function createPeerConnection(lasticecandidate) {
  configuration = {
    iceServers: [{
      urls: "stun:stun.stunprotocol.org"}]};
  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch(err) {
    chatlog('error: ' + err);
  }
  peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
  peerConnection.onconnectionstatechange = handleconnectionstatechange;
  peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
  return peerConnection;
}

function handleicecandidate(lasticecandidate) {
  return function(event) {
    if (event.candidate != null) {
      console.log('new ice candidate');
    } else {
      console.log('all ice candidates');
      lasticecandidate();
    }
  }
}

function handleconnectionstatechange(event) {}
function handleiceconnectionstatechange(event) {}
function createOfferFailed(reason) {}
function setLocalDone() {}
function setRemoteDoneOffer() {}
function setRemoteFailed(reason) {}
function setLocalFailed(reason) {}
function createAnswerFailed(reason) {}

function datachannelopen() {
}

function datachannelmessage(message) {
  text = message.data;
  chatlog(text);
}

function chatbuttonclick() {
  textelement = document.getElementById('chatinput');
  text = textelement.value
  dataChannel.send(text);
}

//Offering
function clickcreateoffer() {
  peerConnection = createPeerConnection(lasticecandidateOffer);
  dataChannel = peerConnection.createDataChannel('chat');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  createOfferPromise = peerConnection.createOffer();
  createOfferPromise.then(createOfferDone, createOfferFailed);
}

function createOfferDone(offer) {
  setLocalPromise = peerConnection.setLocalDescription(offer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
  dataChannelInitiated = true;
}

function lasticecandidateOffer() {
  textelement = document.getElementById('textoffer');
  offer = peerConnection.localDescription;
  textelement.value = LZString.compressToBase64(JSON.stringify(offer));
}

function clickanswerpasted() {
  textelement = document.getElementById('textanswer');
  answer = JSON.parse(LZString.decompressFromBase64(textelement.value));
  setRemotePromise = peerConnection.setRemoteDescription(answer);
  setRemotePromise.then(setRemoteDoneOffer, setRemoteFailed);
}
//Answering
function clickofferpasted() {
  peerConnection = createPeerConnection(lasticecandidateAnswer);
  peerConnection.ondatachannel = handledatachannel;
  textelement = document.getElementById('textoffer');
  offer = JSON.parse(LZString.decompressFromBase64(textelement.value));
  setRemotePromise = peerConnection.setRemoteDescription(offer);
  setRemotePromise.then(setRemoteDoneAnswer, setRemoteFailed);
}

function setRemoteDoneAnswer() {
  createAnswerPromise = peerConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function createAnswerDone(answer) {
  setLocalPromise = peerConnection.setLocalDescription(answer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
}

function lasticecandidateAnswer() {
  textelement = document.getElementById('textanswer');
  answer = peerConnection.localDescription
  textelement.value = LZString.compressToBase64(JSON.stringify(answer));
}

function handledatachannel(event) {
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  dataChannelInitiated = true;
}
