//global variables
var mainTimer;
var questionList;
var questionsRight;
var questionsWrong;
var questionsCounter;

//global constants
var WAITTOSHOWANSWER = 5000;
var WAITFORSELECTION = 5000;
var WAITFORNEXTQUESTION = 3000;

//function to get new questions
function getQuestions(){
	//ajax paramenters
	var queryURL = "https://opentdb.com/api.php";
	var numOfQuestions = 10;
	var categoryOfQuestion = 31; //31 is for Japanese Anime and Manga
	var typeOfQuestion = "multiple"; 

	//data parameter object
	var dataParameters = {amount: numOfQuestions,
						category: categoryOfQuestion,
						type: typeOfQuestion};

	$.ajax({
		url: queryURL,
		method: "GET",
		data: dataParameters,
		success: populateQuestion,
		error: populateQuestionError
	});

	//resets the various global variables
	questionsRight = 0;
	questionsWrong = 0;
	questionsCounter = 0;
}

//function to parse the response JSON
function populateQuestion(response){
	console.log(response.results);
	questionList = response.results;

	$("#start").css("display", "block");
	$("#start").click(startGame);
}

//function to display error with ajax query
function populateQuestionError(response){
	console.log("Error with calling opentdb api");
}

//function to start the timer for the game
function startGame(){
	$("#start").css("display", "none");
	
	displayQuestion(questionsCounter);
}

//shows the current question
function displayQuestion(){
	//clears the question first
	$("#question").empty();

	//clears the possible answers first
	$("#answers").empty();

	$("#question").html(questionList[questionsCounter].question);

	//sets a timer to wait to display the answers so the player has time to read first
	mainTimer = setTimeout(displayAnswers, WAITTOSHOWANSWER);
}

//reveals the possible answers
function displayAnswers(){
	var alreadyDisplayed = [];

	do{
		//grabs a random index to select to show on the screen
		var random;
		var found

		do{
			random = Math.floor(Math.random() * (questionList[questionsCounter].incorrect_answers.length+1));

			 found = false;

			for(i in alreadyDisplayed){
				if(alreadyDisplayed[i] == random)
					found = true;
			}
		}while(found && alreadyDisplayed.length < 4)

		var newDiv = $("<div>");
		newDiv.addClass("answers");

		//determines if it is the correct answer to show or an incorrect one
		if(random <= 2){
			newDiv.html(questionList[questionsCounter].incorrect_answers[random]);
			newDiv.attr("data", questionList[questionsCounter].incorrect_answers[random]);
		}
		else{
			newDiv.html(questionList[questionsCounter].correct_answer);
			newDiv.attr("data", questionList[questionsCounter].correct_answer);
		}

		newDiv.click(checkAnswer);
		
		$("#answers").append(newDiv);

		//adds to the array of indexes of already displayed answers
		alreadyDisplayed.push(random);
	}while(alreadyDisplayed.length < 4);

	$("#answers").append(newDiv);
	mainTimer = setTimeout(ranOutOfTime, WAITFORSELECTION);
}

//function that forces the player to lose the guess if taking too long
function ranOutOfTime(){
	//increment wrong guesses
	questionsWrong++;

	getNextQuestion();
}

//function to grab the next question
function getNextQuestion(){
	//increment question counter by 1
	if(questionsCounter < questionList.length-1){
		questionsCounter++;

		//sets a timer to wait to display the next question
		mainTimer = setTimeout(displayQuestion, WAITFORNEXTQUESTION);
	}
}

//function to check for correct answer
function checkAnswer(){
	//clears the timer for waiting for a guess
	clearTimeout(mainTimer);

	//removes the click to not allow players to guess multiple times
	$("#answers .answers").unbind("click");

	//checks the attr with the correct answer
	if($(this).attr("data") == questionList[questionsCounter].correct_answer){
		questionsRight++;
		console.log("You got it right");
	}
	else{
		questionsWrong++;
		console.log("You got it wrong");
	}

	//calls the function to queue the next question
	getNextQuestion();
}