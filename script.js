// DOM elements
const menu_page = document.getElementById("menu");
const questions_page = document.getElementById("questions");
const final_page = document.getElementById("finish");

let submitBtn = document.querySelector("#questions__submit-btn");

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
	menu_page.style.display = SHOW;
	final_page.style.display = HIDE;
	questions_page.style.display = HIDE;

	updateHeader(false);

	const menuList = menu_page.querySelector(".menu__list");
	menuList.innerHTML = data.quizzes
		.map(
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
		)
		.join("");

	const menuIcons = menuList.querySelectorAll(".menu__icon");
	menuIcons.forEach((icon) => {
		icon.style.backgroundColor = icon.getAttribute("data-color");
	});

	// handle events on the menu list
	const menuItems = menuList.querySelectorAll(".menu__list-item");
	menuItems.forEach((item, index) => {
		item.addEventListener("click", () => startQuiz(item));
		item.addEventListener("keydown", (e) =>
			arrowsHandler(e, index, menuItems, PAGES_ENUM.menu)
		);
	});
	setFocus(menuItems, 0);
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

	menu_page.style.display = HIDE;
	questions_page.style.display = SHOW;

	const topicData = data.quizzes.find(
		(quiz) => quiz.title.toLowerCase() === currentTopic.toLowerCase()
	);

	const questionsTotalHtmlEl =
		questions_page.querySelector(".questions__total");
	const questionNumHtmlEl = questions_page.querySelector(
		".questions__question-num"
	);
	const questionHtmlEl = questions_page.querySelector(".questions__question");
	const progressBar = questions_page.querySelector("#progress");

	currentQuestion = topicData.questions[currentQuestionIndex];

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

		li.id = option_letters[index];
		li.classList.add("questions__answer", "list-item");
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

		li.addEventListener("click", () => selectOption(index));
		li.addEventListener("keydown", (e) =>
			arrowsHandler(e, index, answerOptions.children, PAGES_ENUM.questions)
		);

		answerOptions.appendChild(li);
		// if (index == 0) li.focus();
		// else li.blur();
	});

	submitBtn = resetSubmitButtonListeners();
	submitBtn.textContent = "Submit answer";
	submitBtn.addEventListener("click", handleSubmitOrNext);

	submitBtn.addEventListener("keydown", (e) =>
		arrowsHandler(
			e,
			answerOptions.children.length,
			answerOptions.children,
			PAGES_ENUM.questions
		)
	);

	setFocus(answerOptions.children, 0);
}
function selectOption(index) {
	console.log("SELECT OPTION");
	[...answerOptions.children].forEach((child) =>
		child.classList.remove("selected")
	);

	answerOptions.children[index].classList.add("selected");
	error_div.style.visibility = "hidden";
}

function submitAnswer() {
	console.log("SUBMIT ANSWER");
	const selected = answerOptions.querySelector(".selected");
	if (!selected) {
		error_div.style.visibility = "visible";
		return;
	}

	const selectedOption = selected.querySelector("input").value;
	const selectedSpanIcon = selected.querySelector(".questions__answer-main");

	let result = "";

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

	questions_page.style.display = HIDE;
	final_page.style.display = SHOW;

	const scoreEl = final_page.querySelector(".finish__score");
	const totalQuestionsEl = final_page.querySelector(".finish__total-questions");
	const playAgainBtn = final_page.querySelector("#finish__again-btn");
	const headerThemeTitle = document.querySelector(".theme-title");
	const themeTitle = final_page.querySelector(".theme-title");

	themeTitle.innerHTML = headerThemeTitle.innerHTML;
	themeTitle.style.visibility = "visible";
	scoreEl.innerText = correctAnswers;
	totalQuestionsEl.innerText = totalQuestions;

	playAgainBtn.addEventListener("click", renderMenuPage);
	// playAgainBtn.addEventListener("keyDown", (e) => {
	// 	if (e.keyCode === 13) renderMenuPage();
	// 	return;
	// });
}

function handleSubmitOrNext() {
	if (isAnswerSubmitted) nextQuestion();
	else submitAnswer();
}

// UTILITY FUNCTIONS
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
	console.trace();
	if (!isAnswerSubmitted) {
		submitAnswer();
	} else {
		nextQuestion();
	}
}

function resetSubmitButtonListeners() {
	const newBtn = submitBtn.cloneNode(true);
	submitBtn.parentNode.replaceChild(newBtn, submitBtn);
	return document.querySelector("#questions__submit-btn");
}

function setFocus(elements, index) {
	console.log(elements, index);
	if (elements[index]) elements[index].focus();
}

function arrowsHandler(e, index, list, page) {
	console.log("ARROWS HANDLER");
	const listLength = list.length;
	switch (e.keyCode) {
		case 40: // arrow down
			e.preventDefault();
			if (index === listLength - 1) {
				// Move from the last answer to the submit button
				submitBtn.focus();
			} else if (index === listLength) {
				// Wrap around from submit button to the first answer
				setFocus(list, 0);
			} else {
				// Navigate within the options
				setFocus(list, index + 1);
			}
			break;
		case 38: // arrow up
			e.preventDefault();
			if (index === listLength) {
				// Move from submitBtn to the last answer
				setFocus(list, listLength - 1);
			} else {
				// Navigate within the options or wrap around
				setFocus(list, index > 0 ? index - 1 : listLength - 1);
			}
			break;
		case 13: // Enter
			e.preventDefault();
			if (page === PAGES_ENUM.menu) {
				startQuiz(list[index]);
			} else if (page === PAGES_ENUM.questions) {
				if (index === listLength) {
					submitBtn.click(); // Handle submit button
				} else {
					list[index].click(); // Handle answer selection
				}
			}
			break;

		default:
			break;
	}
}

window.onload = async function () {
	data = await fetchData();
	// Initialize the app after data was loaded
	renderMenuPage();
};
