const menu_page = document.getElementById("menu");
const questions_page = document.getElementById("questions");
const final_page = document.getElementById("finish");

const submitBtn = document.querySelector("#questions__submit-btn");

const answerOptions = questions_page.querySelector(".questions__answers");
const error_div = questions_page.querySelector(".error");

// GLOBAL CONSTANTS
const PAGES_ENUM = Object.freeze({
	menu: 1,
	questions: 2,
	final: 3,
});
const option_letters = ["A", "B", "C", "D"];
const SHOW = "flex";
const HIDE = "none";

// STATE
let data = [];
let currentTopic = "";
let totalQuestions = 0;
let correctAnswers = 0;
let currentQuestionIndex = 0;
let currentQuestion = null;

let isAnswerSubmitted = false;

// FLOW FUNDTIONS
function renderMenuPage() {
	console.log("RENDER_MENU_PAGE");
	console.log(data.quizzes);
	final_page.style.display = HIDE;
	menu_page.style.display = SHOW;
	updateHeader(false);

	const menu_list = menu_page.querySelector(".menu__list");
	const menu_items = data.quizzes.map(
		(quiz) => `
        <li class="menu__list-item list-item" tabindex="0" id=${quiz.title} >
            <input type="radio" class="menu__btn" name="menu_item" value=${quiz.title}>
            <label for=${quiz.title}><span class="menu__icon icon" data-color=${quiz.color}>
                    <img
                        src=${quiz.icon}
                        alt=""
                        aria-label="icon-${quiz.title}"
                    /> </span
                >${quiz.title}</label>

        </li>
    `
	);
	menu_list.innerHTML = menu_items.join("\n");
	const menu_icons = menu_list.querySelectorAll(".menu__icon");
	menu_icons.forEach((icon) => {
		icon.style.backgroundColor = icon.getAttribute("data-color");
	});

	// handle events on the menu list
	const menuList_items = menu_list.querySelectorAll(".menu__list-item");
	menuList_items[0].focus();
	menuList_items.forEach((item, index, list) => {
		item.addEventListener("click", () => startQuiz(item));
		item.addEventListener("keydown", (e) =>
			arrowsHandler(e, index, list, PAGES_ENUM.menu)
		);
	});
}

function startQuiz(menuItem) {
	console.log("START QUIZ");
	currentTopic = menuItem.id;
	currentQuestionIndex = 0;
	correctAnswers = 0;
	isAnswerSubmitted = false;
	currentQuestion = null;
	totalQuestions = 0;

	updateHeader(true, menuItem);
	renderQuestionPage();
}

function renderQuestionPage() {
	console.log("RENDER QUESTION PAGE");

	const questionsTotalHtmlEl =
		questions_page.querySelector(".questions__total");
	const questionNumHtmlEl = questions_page.querySelector(
		".questions__question-num"
	);
	const questionHtmlEl = questions_page.querySelector(".questions__question");
	const progressBar = questions_page.querySelector("#progress");

	const topicData = data.quizzes.find(
		(quiz) => quiz.title.toLowerCase() === currentTopic.toLowerCase()
	);

	currentQuestion = topicData.questions[currentQuestionIndex];

	menu_page.style.display = HIDE;
	questions_page.style.display = SHOW;

	totalQuestions = topicData.questions.length;
	progressBar.value = currentQuestionIndex + 1;
	progressBar.max = totalQuestions;
	questionsTotalHtmlEl.textContent = totalQuestions;
	isAnswerSubmitted = false;

	questionHtmlEl.textContent = currentQuestion.question;
	questionNumHtmlEl.textContent = currentQuestionIndex + 1;

	answerOptions.innerHTML = "";

	currentQuestion.options.forEach((option, index) => {
		const li = document.createElement("li");
		li.tabIndex = 0;
		// li.onclick = () => selectOption(index);
		li.id = option_letters[index];
		li.classList.add("questions__answer", "list-item");
		li.addEventListener("click", () => selectOption(index));
		li.addEventListener("keydown", (e) =>
			arrowsHandler(
				e,
				index,
				answerOptions.querySelectorAll(".questions__answer"),
				PAGES_ENUM.questions
			)
		);

		const input = document.createElement("input");
		input.type = "radio";
		input.name = "answer-option";
		input.value = option;

		const label = document.createElement("label");
		label.for = option_letters[index];

		const span1 = document.createElement("span");
		span1.classList.add("icon");
		span1.textContent = option_letters[index];

		const span2 = document.createElement("span");
		span2.classList.add("questions__answer-main");
		span2.textContent = option;

		label.appendChild(span1);
		label.appendChild(span2);

		li.appendChild(input);
		li.appendChild(label);

		answerOptions.appendChild(li);
		if (index == 0) li.focus();
	});

	submitBtn.addEventListener("click", handleBtnClick);
	submitBtn.addEventListener("keydown", (e) => {
		if (e.keyCode === 13) handleBtnClick();
	});
}
function selectOption(index) {
	console.log("SELECT OPTION");
	const options = answerOptions.querySelectorAll("li");
	options.forEach((option) => option.classList.remove("selected"));
	options[index].classList.add("selected");
	error_div.style.visibility = "hidden";
	submitBtn.focus();
}

function submitAnswer() {
	console.log("SUBMIT ANSWER");
	const selected = answerOptions.querySelector(".selected");
	if (!selected) {
		console.log("no selected");
		error_div.style.visibility = "visible";
		return;
	}

	const selectedOption = selected.querySelector("input").value;
	const selectedSpanIcon = selected.querySelector(".questions__answer-main");

	if (selectedOption === currentQuestion.answer) {
		console.log("CORRECT");
		selected.classList.add("correct");
		result = "correct";
		correctAnswers++;
	} else {
		console.log("INCORRECT");
		selected.classList.add("incorrect");
		result = "incorrect";
	}
	const img = document.createElement("img");
	img.src = `assets/images/icon-${result}.svg`;
	img.alt = "";
	img.ariaLabel = result;

	selectedSpanIcon.textContent = selectedOption;
	selectedSpanIcon.append = selectedOption;
	selectedSpanIcon.appendChild(img);

	submitBtn.textContent =
		currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz";
	isAnswerSubmitted = true;
}

function nextQuestion() {
	console.log("NEXT QUESTION");
	currentQuestionIndex++;
	if (currentQuestionIndex < totalQuestions) {
		renderQuestionPage();
	} else {
		renderFinalPage();
	}
}
function renderFinalPage() {
	console.log("FINAL_PAGE");

	const scoreEl = final_page.querySelector(".finish__score");
	const totalQuestionsEl = final_page.querySelector(".finish__total-questions");
	const playAgainBtn = final_page.querySelector("#finish__again-btn");

	playAgainBtn.focus();
	questions_page.style.display = "none";
	final_page.style.display = "flex";

	scoreEl.innerText = correctAnswers;
	totalQuestionsEl.innerText = totalQuestions;

	playAgainBtn.addEventListener("click", renderMenuPage);
	playAgainBtn.addEventListener("keyDown", (e) => {
		if (e.keyCode === 13) renderMenuPage();
		return;
	});
}

// HELPER FUNCTIONS
async function fetchData() {
	try {
		const response = await fetch("data.json");
		return await response.json();
	} catch (err) {
		console.log("couldn't load data", err);
	}
}

function updateHeader(isVisible, menuLiElement) {
	console.log("UPDATE HEADER");
	const themeTitle = document.querySelector(".theme-title");
	if (menuLiElement) {
		const menuItemIcon = menuLiElement.querySelector("label");
		themeTitle.innerHTML = menuItemIcon.innerHTML;
	}
	themeTitle.style.visibility = isVisible ? "visible" : "hidden";
}

function handleBtnClick() {
	console.log("HANDLE BTN CLICK");
	if (!isAnswerSubmitted) {
		submitAnswer();
	} else {
		nextQuestion();
	}
}

function arrowsHandler(e, index, list, page) {
	console.log("ARROWS HANDLER");
	console.log(e.keyCode == "40");
	switch (e.keyCode) {
		case 40: // arrow down
			console.log(e.keyCode);
			e.currentTarget.blur();
			if (index >= list.length - 1) {
				//switch to the first item cuz the last item in the list was clicked - no other way to get down
				list[0].focus();
				console.log(list[0]);
			} else {
				list[index + 1].focus();
				console.log(list[index + 1]);
			}
			break;
		case 38: // arrow up
			e.currentTarget.blur();
			if (index <= 0) {
				//switch to the last item cuz it's the first item in the list - no other way to get up
				list[list.length - 1].focus();
				console.log(list[list.length - 1]);
			} else {
				list[index - 1].focus();
				console.log(list[index - 1]);
			}
			break;
		case 13: // enter
			if (page === PAGES_ENUM.menu) {
				startQuiz(e.currentTarget);
			} else if (page === PAGES_ENUM.questions) {
				selectOption(index);
			}
			break;
		default:
			console.log("default");
			return;
	}
}

window.onload = async function () {
	data = await fetchData();
	// Initialize the app after data was loaded
	renderMenuPage();
};
