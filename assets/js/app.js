//global variables
var mainTimer;
var questionList;

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
}

//function to parse the response JSON
function populateQuestion(response){
	console.log(response.results);
	questionList = response.results;

	$("#start").click(startGame);
}

//function to display error with ajax query
function populateQuestionError(response){
	console.log("Error with calling opentdb api");
}

//function to start the timer for the game
function startGame(){
	$("#question").html(questionList[0].question);
	mainTimer = setTimeout(displayAnswers, 5000, 0);
}

function displayAnswers(num){
	for(i in questionList[num].incorrect_answers){
		var newDiv = $("<div>");
		newDiv.html(questionList[num].incorrect_answers[i]);
		$("#answers").append(newDiv);
	}

	var newDiv = $("<div>");
	newDiv.html(questionList[num].correct_answer);
	$("#answers").append(newDiv);
	mainTimer = setTimeout(ranOutOfTime, 3000);
}

function ranOutOfTime(){
	console.log("You ran out of time");
}