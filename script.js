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
const mainTimer     = document.querySelector('.main-timer');
const PoS           = document.querySelector('#PoS');
const blanks        = document.querySelector('#blanks');
const nextBtn       = document.querySelector('#nextBtn');
const homeBtn       = document.querySelector('#homeBtn');
const viewBtn       = document.querySelector('#viewBtn');
const tagsBtn       = document.querySelector('#tagsBtn');
const pracBtn       = document.querySelector('#pracBtn');
const speakBtn      = document.querySelector('#speakBtn');
const printBtn      = document.querySelector('#printBtn');
const playerCount   = document.querySelector('#playerCount');
const randBtn       = document.querySelector('.rand-btn');
const actionBar     = document.querySelector('.action-bar')
const actionBtns    = document.querySelector('.action-btns');
const tagsMenu      = document.querySelector('.tags-menu');

let timerArr;
let timerIdx = 0;

let wordList;
let wordQueue = [];
let allTags = [];
let excludeTags = [];
let onlyTag = '';
let currentIndex;
let practiceCountup = 1;


nextBtn.addEventListener('click', next);
viewBtn.addEventListener('click', switchLayerWrap('views'));
pracBtn.addEventListener('click', switchLayerWrap('practice'));
homeBtn.addEventListener('click', switchLayerWrap('menu'));
speakBtn.addEventListener('click', speakCurrentWord);
printBtn.addEventListener('click', printWrap);
tagsBtn.addEventListener('click', toggleTagsMenu)

function loadJSON(){
    fetch('./data/new600.json')
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
        populateQueue();
        randBtn.addEventListener('click', pickRandomWord);
        checkTags(wordList);
        // console.log(data)
    })
    .catch(error => console.log('ERROR: ' + error));
}

loadJSON();

function printWrap() {
    window.print()
}

function pickRandomWord() {
    if (wordQueue.length < 1) {
        populateQueue();
    }
    
    const randPick = wordQueue.shift();

    const prevHighlight = document.querySelector('.card-high');
    if (prevHighlight) {
        prevHighlight.classList.remove('card-high');
    }

    const pickElem = allCards.children[randPick];
    pickElem.classList.add('card-high');
    allCards.scroll({
        top: pickElem.offsetTop - (document.documentElement.scrollHeight / 2) + (pickElem.offsetHeight / 2),
        left: 0,
        behavior: "instant",
    });

    console.log(wordList[randPick].en[0]);
}    

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
                populateViewCards(wordList);
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
    const currentWord = wordList[currentIndex].en
    synthSpeak(currentWord, 0.5, 1.0, 'en')
}

function threeCurrentWord() {
    const threeReps = 
        wordList[currentIndex].en + ". " +
        wordList[currentIndex].en + ". " +
        wordList[currentIndex].en + "."

    synthSpeak(threeReps, 0.5, 1.0, 'en')
}

function populateViewCards(arr, only, excludeArr) {
    allCards.innerHTML = '';
    
    for (let i = 0; i < arr.length; i++) {
        const tagCheck = arr[i].tags;
        let noExc = true;

        if (excludeArr) {
            excludeArr.forEach(exc => {
                if (tagCheck.includes(exc)) {
                    noExc = false;
                }
            })
        }
        
        if ((only && tagCheck.includes(only)) ||
            (!only && noExc)) 
        {
            const thisEng   = arr[i].en[0];
            const thisChin  = arr[i].zh;
            const posArr    = arr[i].pos;
            const spellStr = processToSynth(thisEng);
    
            const newCard = document.createElement('div');
            newCard.classList.add('one-card');
            
            const numDiv = document.createElement('div');
            numDiv.classList.add('front-num')
            numDiv.innerText = i + 1;
    
            const btnBar = document.createElement('div');
            btnBar.classList.add('btn-bar');
    
            const wordBtn = document.createElement('button');
            wordBtn.innerText = 'speak';
            wordBtn.addEventListener('click', synthSpeakWrap(thisEng));
    
            const synthBtn = document.createElement('button');
            synthBtn.innerText = 'spell';
            synthBtn.addEventListener('click', synthSpeakWrap(spellStr));
    
            btnBar.append(wordBtn);
            btnBar.append(synthBtn);
    
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
            newCard.append(btnBar);
            newCard.append(engDiv);
            newCard.append(chinDiv);
            newCard.append(posDiv);
    
            allCards.append(newCard);
        }
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
        const thisWord = reduceToOneWord(wordList[arr[i]].en) 
        lineItem.innerText = (i + 1) + ". " + thisWord;

        printLayer.append(lineItem);
    }
}

function updateDisplay() {
    currentIndex = wordQueue.shift();
    const word = reduceToOneWord(wordList[currentIndex].en);

    blanks.innerText = convertToBlanks(word);
    PoS.innerText = practiceCountup + ". " + wordList[currentIndex].pos[0];
}

function revealWord() {
    const thisWord = reduceToOneWord(wordList[currentIndex].en);
    blanks.innerText = thisWord;
}

function selectElement(elem) {
    const prevSelect = document.querySelector('.selected');
    if (prevSelect) {
        prevSelect.classList.remove('selected');
    }

    elem.classList.add('selected');
}

function reduceToOneWord(arr) {

    return arr[0]
}

function reconfigButtons(str) {
    if (str == 'menu') {
        const allButtons = actionBtns.children;
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

function checkTags(json) {
    json.forEach(entry => {
        entry.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
                allTags.push(tag);
            }
        })
    })

    populateTags(allTags.sort())
}

function populateTags(arr) {
    arr.forEach(tag => {
        const newBtn = document.createElement('button');
        newBtn.addEventListener('click', tagWrap(tag))
        newBtn.innerText = tag;

        tagsMenu.append(newBtn);
    })
}

function toggleTagsMenu() {
    if(actionBar.classList.contains('flat')) {
        actionBar.classList.remove('flat');
    } else {
        actionBar.classList.add('flat');
    }
}

toggleTagsMenu()

function cycleTag(str, elem) {
    if (onlyTag == str) {
        onlyTag = '';
        const allGrayed = tagsMenu.querySelectorAll('.grayed');

        allGrayed.forEach(elem => {
            elem.classList.remove('grayed')
        })

    } else if (!excludeTags.includes(str)) {
        onlyTag = '';
        excludeTags.push(str);
        elem.classList.add('grayed');

    } else {
        excludeTags = [];
        onlyTag = str;
        flipTags();
    }

    populateViewCards(wordList, onlyTag, excludeTags);
}

function tagWrap(str) {
    return function executeOnEvent(e) {
        cycleTag(str, e.target);
    }
}

function flipTags() {
    const allTags = Array.from(tagsMenu.children)

    allTags.forEach(elem => {
        if (elem.classList.contains('grayed')) {
            elem.classList.remove('grayed');
        } else {
            elem.classList.add('grayed');
        }
    })
}
