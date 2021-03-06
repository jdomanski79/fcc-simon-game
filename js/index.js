'use strict';
console.clear();
(function(){
  // variables 
  let strictMode = false;
  let simonGameOff = true;
  const buttonsId = ['tr','br','bl','tl'];
  const buttonSounds = {
    tr : new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
    br : new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
    bl : new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
    tl : new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'), 
  }
  let notifyWindow = document.getElementById('count');
  let buttons = document.querySelectorAll('.main-btn');
  let mainSequence;
  let userSequence;
  const USER_MOVE_TIME = 5000;
  const PLAY_SEQUENCE_TIME = 700;
  let userMoveTimeout;
  let pressedButtonId;
  let notifyTimeout;
  let autoTurnoffCounter;
  let playSeqInterval;
  let userCorrect;
  
    //event listeners
  document.getElementById('strict-btn').addEventListener('click',toggleStrictMode);
  document.getElementById('start-btn').addEventListener('click',() => nextStep(true));
  // inital
  
  function toggleStrictMode(){
    if (!simonGameOff) {
      document.getElementById('strict-light').classList.toggle('active');
      strictMode = !strictMode;
    }
  }
  
  function nextStep(start){
    if (start){
      if (simonGameOff) {
        startButtonLight(true);
        simonGameOff = false;
      }

      autoTurnoffCounter = 0;
      // reset all
      clearTimeout(userMoveTimeout);
      clearTimeout(notifyTimeout);
      clearInterval(playSeqInterval);
      mainSequence = [randomMove()];
    } else {
      mainSequence.push(randomMove());
    }
    
    userSequence = [];
    // flash count window, then playMainSequence
    notify(String(mainSequence.length), playMainSequence);
  }
  
  function listenUser(action){
    if (action === 'on') {
      document.addEventListener('mouseup',handleBtnClicked);
      
      for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener('mousedown',handleBtnClicked);
        buttons[i].classList.add('pointer');
      }
    } else if (action === 'off') {
      document.removeEventListener('mouseup',handleBtnClicked);
      
      for (let i = 0; i < buttons.length; i++){
        buttons[i].removeEventListener('mousedown',handleBtnClicked);
        buttons[i].classList.remove('pointer');
      }
    }
  }
  
  function playSound(btnId){
    buttonSounds[btnId].play();
    //console.log('Playing btn ', btnId);
  }
  
  function handleBtnClicked (event){
    clearTimeout(userMoveTimeout);
    autoTurnoffCounter = 0;

    if (event.type === 'mousedown'){
      pressedButtonId = this.id;
      this.classList.add('flash'); // flash button
      playSound(this.id);
      userSequence.push(this.id);
      userCorrect = isUserSeqCorrect();
      return;
    } 
    
    if (event.type === 'mouseup' && pressedButtonId){
			document.getElementById(pressedButtonId).classList.remove('flash');
      pressedButtonId = null;    	
      handleUserAnswer(userCorrect);
    }
  }
    
  
  function isUserSeqCorrect(){
    return userSequence.every((el,i) => {
      return el === mainSequence[i];
    });
  }
  
  function handleUserAnswer(userCorrect){
    console.log('User history: ', userSequence);
    
    if (!userCorrect) { 
      handleUserIncorrect();
    } else if (userSequence.length === mainSequence.length){
      if (mainSequence.length === 20){
        console.log('You won - 20 repats');
        nextStep(true);
        return;
      }
      console.log('GOOD!!!');
      nextStep();
    } else {
      setUserMoveTimeout();
    }
  }
  
  
  function handleUserIncorrect() {
    if (strictMode) {
        notify('!!!', () => nextStep(true));
        return;
      }
      notify('!!!', replayHistory);
  }

  function replayHistory(){
    userSequence = [];
		updCountWindow();    
    notify(String(mainSequence.length),playMainSequence);
  }
  
  function updCountWindow(msg){
    notifyWindow.innerHTML = (msg) ? msg : mainSequence.length;
  }
  
  function notify(msg,callback){
    listenUser('off');
    let counter = 1;
    notifyTimeout = setTimeout(setNotifyTimeout,400,msg,0,callback);
  }
      
  function setNotifyTimeout(msg, repetition,callback){    
    if (repetition % 2 === 0) updCountWindow(msg);
    else updCountWindow('&nbsp');
    
    if (repetition === 4){
      if (callback) callback();
      return;
    }
    
    repetition++;
    notifyTimeout = setTimeout(setNotifyTimeout, 400, msg, repetition, callback);
    
  }
 
  function playMainSequence(){
    let currField;
    let sequence = mainSequence.slice(0);
    //turning off button listeners
    console.log(sequence);
    listenUser('off');
    
    playSeqInterval = setInterval(()=>{
      
      currField = sequence.shift();
      playSound(currField);
      flash(currField);

      if (sequence.length === 0){
        clearInterval(playSeqInterval);
        setUserMoveTimeout();
        listenUser('on');
      }
    },PLAY_SEQUENCE_TIME);
  }
  
  function setUserMoveTimeout(){
    userMoveTimeout = setTimeout(handleUserTimeout, USER_MOVE_TIME);
  }

  function handleUserTimeout() {
    console.log('autoTurnoffCounter: ', autoTurnoffCounter);
    if (++autoTurnoffCounter === 4) {
      document.querySelector('.count-window').innerHTML = '&nbsp';
      startButtonLight(false);
      simonGameOff = true;
    } else {
      handleUserIncorrect();
    }
  }
function startButtonLight(turnOn) {
  let backgroundColor = turnOn ? 'yellow':'';
  document.querySelector('.start-btn').style.backgroundColor = backgroundColor;
}

  
  function flash(field){
    document.getElementById(field).classList.add('flash');
    setTimeout( () => document.getElementById(field).classList.remove('flash'),PLAY_SEQUENCE_TIME/2);  
  }
  
  function randomMove(){
    return buttonsId[Math.floor(Math.random()*4)];
  }
  
})();