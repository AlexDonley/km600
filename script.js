import { 
    startTimer2, stopTimer2, countDownTimer, stopCountDown, timerInterval
} from './js/timer.js'
import {
    generateConicGrad
} from './js/gradients.js'
import { synthSpeak } from './js/speech-synth.js'
import { myShuffle } from './js/shuffle.js'

const timerDiv    = document.querySelector('.timers');
const printLayer     = document.querySelector('.printing');
const allCards      = document.querySelector('.all-cards');
const mainTimer     = document.querySelector('.main-timer')
const PoS           = document.querySelector('#PoS');
const blanks        = document.querySelector('#blanks');
const nextBtn       = document.querySelector('#nextBtn');
const homeBtn       = document.querySelector('#homeBtn')
const viewBtn       = document.querySelector('#viewBtn');
const pracBtn       = document.querySelector('#pracBtn');
const speakBtn      = document.querySelector('#speakBtn');
const printBtn      = document.querySelector('#printBtn');
const playerCount   = document.querySelector('#playerCount');

let timerArr;
let timerIdx = 0;

let wordList;
let wordQueue = [];
let currentIndex;
let practiceCountup = 1;


nextBtn.addEventListener('click', next);
viewBtn.addEventListener('click', switchLayerWrap('views'));
pracBtn.addEventListener('click', switchLayerWrap('practice'));
homeBtn.addEventListener('click', switchLayerWrap('menu'));
speakBtn.addEventListener('click', speakCurrentWord);
printBtn.addEventListener('click', printWrap);

function printWrap() {
    window.print()
}

// TO DO
// Open with a menu
// Options:
// 1. View words (in order)
// 2. Competition practice
// 3. Typing
//      - Listen and type
//      - Fill in the blank(s)
// 4. Speaking     

function populateTimers(n) {
    timerDiv.innerHTML = ''
    
    for (let i = 0; i < n; i++) {
        const newTimer = document.createElement('div');
        newTimer.classList.add('student-timer');
        newTimer.classList.add('center-shadow');
        newTimer.id = "timer_" + i;

        newTimer.innerText = "10";

        timerDiv.append(newTimer)
    }

    timerArr = document.querySelectorAll('.student-timer');
    console.log(timerArr)
}

function switchToLayer(str) {
    const formerLayer = document.querySelector('.layer:not(.hide)');
    formerLayer.classList.add('hide')
    
    const thisLayer = document.querySelector('.layer.' + str);
    console.log(thisLayer);

    thisLayer.classList.remove('hide');
}

function switchLayerWrap(str) {
    return function executeOnEvent (e) {
        switchToLayer(str)
        reconfigButtons(str)

        switch(str) {
            case 'practice':
                populateTimers(playerCount.value);

                populateQueue();
                updateDisplay();
                
                break;
            case 'views':
                populateViewCards(wordList.length);
                break;
        }
    }
}

function synthSpeakWrap(str) {
    return function executeOnEvent (e) {
        synthSpeak(str, 0.5, 1.0, 'en')
    }
}

function speakCurrentWord() {
    const currentWord = wordList[currentIndex].word
    synthSpeak(currentWord, 0.5, 1.0, 'en')
}

function threeCurrentWord() {
    const threeReps = 
        wordList[currentIndex].word + ". " +
        wordList[currentIndex].word + ". " +
        wordList[currentIndex].word + "."

    synthSpeak(threeReps, 0.5, 1.0, 'en')
}

function populateViewCards(n) {
    allCards.innerHTML = ''
    
    for (let i = 0; i < n; i++) {
        const thisEng = wordList[i].word;
        const thisChin = wordList[i].chinese;
        const posArr = wordList[i].pos;
        const synthStr = processToSynth(thisEng);

        const newCard = document.createElement('div');
        newCard.classList.add('one-card');
        
        const numDiv = document.createElement('div');
        numDiv.innerText = i + 1;

        const synthBtn = document.createElement('button');
        synthBtn.innerText = 'play';
        synthBtn.addEventListener('click', synthSpeakWrap(synthStr))

        const engDiv = document.createElement('div');
        engDiv.classList.add('view-eng');
        engDiv.innerText = thisEng;

        const chinDiv = document.createElement('div');
        chinDiv.classList.add('view-chin');
        chinDiv.innerText = thisChin;

        const posDiv = document.createElement('div');
        posDiv.classList.add('view-pos');
        posDiv.innerText = posArr;

        newCard.append(numDiv);
        newCard.append(synthBtn)
        newCard.append(engDiv);
        newCard.append(chinDiv);
        newCard.append(posDiv);

        allCards.append(newCard);
    }
}

function processToSynth(str) {
    let newStr = str + ", ";

    const letArr = str.split('');

    letArr.forEach(letter => {
        newStr += letter + ", ";
    })

    newStr += str + "."

    return newStr
}

function loadJSON(){
    fetch('./data/km600_2024.json')
    .then(res => {
        if (res.ok) {
            console.log('SUCCESS');
        } else {
            console.log('FAILURE');
        }
        return res.json()
    })
    .then(data => {
        wordList = data;
        // console.log(data)
    })
    .catch(error => console.log('ERROR'));
}

loadJSON();

function resetAllTimers() {
    timerIdx = 0;
    
    for (let n = 0; n < timerArr.length; n++){

        timerArr[n].style.background = 'blue';
        timerArr[n].innerHTML = 10;
    }

    mainTimer.style.background = 'blue';
    mainTimer.innerText = 6;
    mainTimer.classList.remove('selected')
}

function finishOneTimer(n){

    if (timerIdx == playerCount.value) {

        mainTimer.innerText = 0;
        mainTimer.style.background = 'navy'
        revealWord()

    } else {
        
        timerArr[n].innerText = 0;
        timerArr[n].style.background = 'navy'
        
    }
    timerIdx++;
}

function next() {

    if(!timerInterval){

        if (timerIdx > playerCount.value) {

            resetAllTimers();
            practiceCountup++;
            updateDisplay();
    
        } else if (timerIdx == playerCount.value) {
    
            if (mainTimer.innerText == 0) {
                timerIdx++
                revealWord()
            } else {
                selectElement(mainTimer)
                countDownTimer(6, 999, mainTimer)
                threeCurrentWord()
            }

        } else {
            
            if (timerArr[timerIdx].innerText == 0) {
                timerIdx++
            } else {
                selectElement(timerArr[timerIdx]);
                countDownTimer(10, 999, timerArr[timerIdx]);
            }
            
        }

    } else {
        stopCountDown();

        finishOneTimer(timerIdx);
    }
}

function convertToBlanks(word){
    let blank = ""

    for (let n = 0; n < word.length; n++) {
        blank += "_ "
    }

    console.log(blank);
    return blank;
}

function populateQueue() {
    wordQueue = [];

    let unshuffledIdx = []
    
    for (let n = 0; n < wordList.length; n++) {
        unshuffledIdx.push(n);
    }

    wordQueue = myShuffle(unshuffledIdx)

    writeToPrintout(wordQueue, 50)

    console.log(wordQueue);
}

function writeToPrintout(arr, int) {

    printLayer.innerHTML = '';
    
    for (let i = 0; i < int; i++) {
        const lineItem = document.createElement('div');
        const thisWord = reduceToOneWord(wordList[arr[i]].word) 
        lineItem.innerText = (i + 1) + ". " + thisWord;

        printLayer.append(lineItem);
    }
}

function updateDisplay() {
    currentIndex = wordQueue.shift();
    const word = reduceToOneWord(wordList[currentIndex].word);

    blanks.innerText = convertToBlanks(word);
    PoS.innerText = practiceCountup + ". " + wordList[currentIndex].pos[0];
}

function revealWord() {
    const thisWord = reduceToOneWord(wordList[currentIndex].word);
    blanks.innerText = thisWord;
}

function selectElement(elem) {
    const prevSelect = document.querySelector('.selected');
    if (prevSelect) {
        prevSelect.classList.remove('selected');
    }

    elem.classList.add('selected');
}

function reduceToOneWord(str) {
    let wordsArr = str.split(',')

    return wordsArr[0]
}

function reconfigButtons(str) {
    if (str == 'menu') {
        const allButtons = actionBar.children;
        console.log(allButtons);

        for (let i = 1; i < allButtons.length - 1; i++) {
            allButtons[i].classList.add('thin');
        }
    } else {
        const pickedButtons = document.querySelectorAll('.for-' + str);

        pickedButtons.forEach(elem => {
            elem.classList.remove('thin');
        })
    }
}