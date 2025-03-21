// import { 
//      startTimer2, stopTimer2 
// } from './js/timer.js'
import {
    generateConicGrad
} from './gradients.js'

export var timerInterval

var timerObj = {
    "start": null,
    "target": null,
}

// let ding = new Audio("../sound/ding.wav");
// ding.volume = 0.3

export function startTimer2() {
    timerObj.start = grabTimeInt();

    console.log(timerObj.start, intToStampStr(timerObj.start, [0, 1]))
}

export function stopTimer2() {
    const thisTime = grabTimeInt();

    const timeDiff = thisTime - timerObj.start;
    const diffStamp = intToStampStr(timeDiff, [2, 3]);

    console.log(timeDiff, diffStamp);
    return [timeDiff, diffStamp];
}

export function countDownTimer(secInt, res, elem) {
    const now = grabTimeInt()
    
    timerObj.start = now;
    timerObj.target = now + (secInt * 1000);

    timerInterval = setInterval(()=> {
        checkCountDown(elem)
    }, res)
}

export function checkCountDown(elem) {
    const timeDiff = timerObj.target - grabTimeInt();
    const roundedDiff = Math.round(timeDiff/1000)*1000;

    if (roundedDiff <= 0) {
        stopCountDown()
    }

    if (elem) {
        elem.innerText = intToStampStr(roundedDiff, [3, 3]);

        if (!elem.classList.contains('main-timer')) {
            const thisConic = generateConicGrad(roundedDiff / 10000, 'navy', 'blue')

            elem.style.background = thisConic;
        } else {
            const thisConic = generateConicGrad((roundedDiff + 3000) / 12000, 'navy', 'blue')

            elem.style.background = thisConic;
        }
    }

    return roundedDiff
}

export function stopCountDown() {
    clearInterval(timerInterval);
    timerInterval = null;
}

export function grabTimeInt() {
    const date = new Date;

    return date.getTime()
}

export function intToTimeArr(int) {
    const day = Math.floor(int / 86400000);
    const hour = Math.floor(int / 3600000) % 24;
    const min = Math.floor(int / 60000) % 60;
    const sec = Math.floor(int / 1000) % 60;
    const mil = int % 1000;
    
    const finalArr = [day, hour, min, sec, mil];
    //console.log(int, finalArr);

    return finalArr
}

function timeArrToStampStr(arr, rangeArr) {
    let timeStampStr = '';
    let stringStart = false;

    if (rangeArr) {

        for (let i = rangeArr[0]; i <= rangeArr[1]; i++) {
            if ( i == rangeArr[0] ) {
                timeStampStr += arr[i];
            } else {
                timeStampStr += '_';
                timeStampStr += appendZero(arr[i]);
            }
        }

    } else {
        arr.forEach(int => {
            if (int > 0 || stringStart) {
                if (stringStart) {
                    timeStampStr += '_';
                    timeStampStr += appendZero(int);
                } else {
                    stringStart = true;
                    timeStampStr += int;
                }
            }
        })    
    }

    return timeStampStr;
}

function intToStampStr(int, rangeArr) {
    
    return timeArrToStampStr(intToTimeArr(int), rangeArr)
}
  
function appendZero(n) {
    n = String(n)
    
    if (n.length < 2) {
        return "0" + n
    } else {
        return n
    }
}