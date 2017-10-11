//global variables
var mainTimer;
var timerToAnswer;
var questionList;
var questionsRight;
var questionsWrong;
var questionsCounter;
var timeRemaining;

//global constants
var WAITTOSHOWANSWER = 5000;
var WAITFORSELECTION = 5000;
var WAITFORNEXTQUESTION = 3000;

//function to get new questions
function getQuestions(){
	//ajax paramenters
	var queryURL = "https://opentdb.com/api.php";
	var numOfQuestions = 10;
	var categoryOfQuestion = 31; //31 is for Japanese Anime and Manga 21 is for sports
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

	//clears the previous results
	$("#correct").html("");
	$("#wrong").html("");
}

//function to parse the response JSON
function populateQuestion(response){
	questionList = response.results;

	displayQuestion(questionsCounter);
}

//function to display error with ajax query
function populateQuestionError(response){
	console.log("Error with calling opentdb api");
}

//function to start the timer for the game
function startGame(){
	$("#start").css("display", "none");
	
	//calls the api to get the questions from the api
	getQuestions();
}

//shows the current question
function displayQuestion(){
	//clears the question first
	$("#question").empty();

	//clears the possible answers first
	$("#answers").empty();

	$("#question").html("<h4>Question "+(questionsCounter+1)+":</h4> "+questionList[questionsCounter].question+" ("+questionList[questionsCounter].difficulty+")");

	//clears the time remaining on the page
	$("#timer").html("");

	//clears the word results
	$("#text-response").html("");

	//sets a timer to wait to display the answers so the player has time to read first
	mainTimer = setTimeout(displayAnswers, WAITTOSHOWANSWER);

}

//reveals the possible answers
function displayAnswers(){
	var alreadyDisplayed = [];
	var newList = $("<ol>");

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

		
		var newItem = $("<li>");
		newItem.addClass("answers");

		//determines if it is the correct answer to show or an incorrect one
		if(random <= 2){
			newItem.html(questionList[questionsCounter].incorrect_answers[random]);
			newItem.attr("data", questionList[questionsCounter].incorrect_answers[random]);
		}
		else{
			newItem.html(questionList[questionsCounter].correct_answer);
			newItem.attr("data", questionList[questionsCounter].correct_answer);
		}

		newItem.click(checkAnswer);

		newList.append(newItem);

		//adds to the array of indexes of already displayed answers
		alreadyDisplayed.push(random);
	}while(alreadyDisplayed.length < 4);

	$("#answers").append(newList);

	//set an interval to display the time left and shows on the page
	timeRemaining = WAITFORSELECTION / 1000;
	$("#timer").html("<h5>Time Remaining: </h5>"+timeRemaining);

	timerToAnswer = setInterval(countDown, 1000);

	//timer to choose the answer
	mainTimer = setTimeout(ranOutOfTime, WAITFORSELECTION);
}

//function that forces the player to lose the guess if taking too long
function ranOutOfTime(){
	//clears the interval
	clearInterval(timerToAnswer);
	$("#timer").html("");

	//displays time ran out
	$("#text-response").html("RAN OUT OF TIME!");

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
	//calls the reveal results function
	else
		mainTimer = setTimeout(showResults, WAITFORNEXTQUESTION);
}

//function to check for correct answer
function checkAnswer(){
	//clears the timer for waiting for a guess
	clearTimeout(mainTimer);

	//clears the interval
	clearInterval(timerToAnswer);

	//removes the click to not allow players to guess multiple times
	$("#answers .answers").unbind("click");

	//checks the attr with the correct answer
	if($(this).attr("data") == questionList[questionsCounter].correct_answer){
		questionsRight++;
		$(this).addClass("correct");
		$("#text-response").html("CORRECT!");
	}
	else{
		questionsWrong++;
		$(this).addClass("wrong");
		$("#text-response").html("WRONG!");

		//checks all the div child and highlights the correct one
		$("#answers .answers").each(function(){
			if($(this).attr("data") == questionList[questionsCounter].correct_answer)
				$(this).addClass("correct");
		});
	}

	//calls the function to queue the next question
	getNextQuestion();
}

//function to display the results
function showResults(){
	//reveals the start button and changes the text to repurpose it
	$("#start").html("Play Again?");
	$("#start").css("display", "block");

	$("#correct").html("<h5>Answered correctly:</h5> "+questionsRight);
	$("#wrong").html("<h5>Answered incorrectly:</h5> "+questionsWrong);

	//clears the question first
	$("#question").empty();

	//clears the possible answers first
	$("#answers").empty();

	//clears the word results
	$("#text-response").html("");

	//clears the timer on the page
	$("#timer").html("");
}

//function counter decrease and display on the page
function countDown(){
	timeRemaining--;

	$("#timer").html("<h5>Time Remaining:</h5> "+timeRemaining);
}