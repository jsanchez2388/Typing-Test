//API used to retrive random quote
const quoteApiUrl = "https://api.quotable.io/random?minLength=200&maxLength=250";

//Elements used in code
const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originText = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const minutes = document.querySelector("#mins");
const seconds = document.querySelector("#secs");
const hundredths = document.querySelector("#hund");
const timer = document.querySelector(".timer");
const results = document.querySelector(".results");
const wpm = document.querySelector("#wpm");
const mistakes = document.querySelector("#mistakes");
const accuracy = document.querySelector("#accuracy");

//variables needed for caculations
let quote ="";
let misses = 0;
let minute = 0;
let second = 0;
let hundredth = 0;
let start = false;
let finished = false;
let intervalID = null; 
const NO_OF_FASTEST_TIMES = 3;
const FASTEST_TIMES = "fastestTimes";

//Reset the test and show fastest times on window load
window.onload = () => {
  resetTest();
  showFastestTimes();
}

//Logic for comparing times
function checkFastestTimes(time) {
  //Get the list of fastest times, parse it, and save it to a const
  const fastestTimes = JSON.parse(localStorage.getItem(FASTEST_TIMES)) ?? []; 
  
  //Save the slowest time saved in the array or set it to 0 if missing
  const slowestTime = fastestTimes[NO_OF_FASTEST_TIMES - 1]?.time ?? 0; 
  
  //If the new time is faster than the slowest time or if there is no slowest time
  if (time < slowestTime || slowestTime == 0) { 
    // Add the new time to the array and update it
    saveFastTime(time, fastestTimes); 
    // Show the updated array
    showFastestTimes(); 
  }
}

//Add new time, sort the array, and save to local storage
function saveFastTime(time, fastestTimes) {
  //Prompt user of new top time, ask for a name
  const name = prompt('You earned a top 3 time! Enter name:');
  
  //Create a new entry for the array
  const newTime = { time, name };
  
  //Add new time to array
  fastestTimes.push(newTime);
  console.log(fastestTimes);

  // Sort the array from least to greatest
  fastestTimes.sort(compareNumbers); 

  //Only keep the top 3 times
  fastestTimes.splice(NO_OF_FASTEST_TIMES);
  
  // Save to local storage
  localStorage.setItem(FASTEST_TIMES, JSON.stringify(fastestTimes));
};

//Used to sort the array from least to greatest
//Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function compareNumbers(a, b) {
  return a.time - b.time;
}


function showFastestTimes() {
  //Retrive array of fastest times from local storage or make an empty array
  const fastestTImes = JSON.parse(localStorage.getItem(FASTEST_TIMES)) ?? [];
  
  //Select the element where times will be displayed
  const fastestTimesList = document.querySelector("." + FASTEST_TIMES);
  
  //Update the content of the selected element
  fastestTimesList.innerHTML = fastestTImes
    .map((time) => `<li>${formatTime(time.time)} - ${time.name}</li>`)
    .join('');
}

//Format time for displaying on fastest times
function formatTime(time){
  let minutes = Math.trunc(time); //Get only the integer representing minutes
  time = time - (minutes); //Remove minutes from time
  let seconds = Math.trunc(time*60); //Calculate the number of seconds
  time = time - (seconds/60); //Remove seconds from time
  let hundredths = Math.round(time * 6000); //Calculate hundredths of seconds
  
  //variables used to generate strings
  let minString = minutes;
  let secString = seconds;
  let hundredthString = hundredths;

  // Add leading zero to numbers 9 or below (purely for aesthetics):
  if (minutes < 10) {
      minString = "0" + minString;
  }
  if (seconds < 10) {
      secString = "0" + secString;
  }
  if (hundredths < 10) {
      hundredthString = "0" + hundredthString;
  }
  
  //Return time string  
  return minString + ":" + secString + ":" + hundredthString;
}

//Get a new quote and add it to originText element
const getNewQuote = async () => {
  //fetch the quote
  const response = await fetch(quoteApiUrl);
  let data = await response.json();
  quote = data.content;
  
  //Save the quote as an array
  let arr = quote.split("").map((value) => {
    //Add each character in a span so it can be modified individually
    return "<span class='quoteChar'>" + value + "</span>"; 
  })
  //Join the array and display the text on the origin text eleement
  originText.innerHTML = arr.join("");
  
}


// Match the text entered with the provided text on the page:
testWrapper.addEventListener("input", () => {
  //select all of the characters in the quote
  let quoteChars = document.querySelectorAll(".quoteChar");
  //Create an array from all of the characters in the quote
  quoteChars = Array.from(quoteChars);
  //get the user inputed text
  let userInput = testArea.value;
  
  //Iterate through each of the characters in the quote
  quoteChars.forEach((char, index) => {
    //Add a class to the char depending on whether it matches the quote char or not
    if (char.innerText == userInput[index]) {
      char.classList.add("correct");
    } else if (userInput[index] == null) {
        char.classList.contains("correct") ? char.classList.remove("correct") : char.classList.remove("incorrect");
    } else {
      if (!char.classList.contains("incorrect")){
        misses += 1;
        char.classList.add("incorrect");
      }
    }
  });
  
  //If the length of the user input matches the length of the quote
  if (userInput.length == quoteChars.length){
    //update start and finished values
    start = false;
    finished = true;
    //clear the interval running the stopwatch function
    clearInterval(intervalID);
    //disable the test area to prevent additional input
    testArea.disabled = true;
    //Display the results
    results.style.display = "block";
    //Calculate the time the test took
    let tTime = (((hundredth * 0.01) + second) / 60) + minute;
    //Caculate and display WPM using an avg of 5 characters per word
    wpm.innerHTML = ((userInput.length / 5) / tTime).toFixed(1) ;
    //Display mistakes
    mistakes.innerHTML = misses;
    //Calculate and display the accuracy
    accuracy.innerHTML = (((userInput.length - misses) / userInput.length) * 100).toFixed(2);
    //Check if the time should be added to the top 3 fastest times
    checkFastestTimes(tTime);
  }
});


// Start the timer:
function stopWatch() {
  //If the test has started and has not finished
  if (start && !finished){
    hundredth++; //increate hundredth by 1
    
    //if reached 100 hundredths
    if (hundredth == 100) {
      hundredth = 0; //reset hundredth to 0
      second++; //increase second by 1
      
      //if seconds gets to 60
      if (second == 60) {
        minute++; //increate minute by 1
        second = 0; // reset seconds to 0
      }
    }
    //variables used to convert time into strings
    let minString = minute;
    let secString = second;
    let hundredthString = hundredth;
    
    // Add leading zero to numbers 9 or below (purely for aesthetics):
    if (minute < 10) {
        minString = "0" + minString;
    }

    if (second < 10) {
        secString = "0" + secString;
    }

    if (hundredth < 10) {
        hundredthString = "0" + hundredthString;
    }
    
    //Update HTML on the page to display the elapsed time
    minutes.innerHTML = minString;
    seconds.innerHTML = secString;
    hundredths.innerHTML = hundredthString;
  }
}

// Reset everything:
function resetTest(){
  //Reset all values that signal the test has started
  start = false;
  finished = false;
  clearInterval(10); //Clear the interval
  testArea.disabled = false; //Enable the test area
  results.style.display = "none"; //Hide the results
  //Reset mistakes and time tracking variables
  misses = 0;
  minute = 0; 
  second = 0;
  hundredth = 0;
  
  //Display the reset stopwatch
  let minString = "00";
  let secString = "00";
  let hundredthString = "00";

  //Display the reset stopwatch
  minutes.innerHTML = minString;
  seconds.innerHTML = secString;
  hundredths.innerHTML = hundredthString;
  
  //Clear the text inside of the text area
  if (testArea.value != ""){
    testArea.value = ""
  }

  testArea.blur(); //Remove the focus from the test area
  getNewQuote(); //Get a new quote
  timer.style.opacity = 0.33; //Set the opacity of the timer
}

// Event listeners for keyboard input and the reset button:
document.getElementById("reset").addEventListener("click", resetTest); //Calls resetTest function when clicked

//Starts the test when a key is pressed down 
testWrapper.addEventListener('keydown', function(){
  //If the test has not been marked as started
  if (!start) {
    intervalID = setInterval(stopWatch, 10); // save the intervalID to the variable and set the interval of the stopWatch function to 10 milliseconds
    start = true; // Update start to signal test has started
    timer.style.opacity = 1; // set the opacity of the timer
  } 
});