document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    let quizData = {};
    let score = 0;
    let questionNumber = 0;
    let startTime;
    let timerInterval;
  
    // Helper function to start the timer
    function startTimer() {
      startTime = Date.now();
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("timer").textContent = `Time: ${elapsed}s`;
      }, 1000);
    }
  
    function loadTemplate(templateId, data = {}) {
        const templateSource = document.getElementById(templateId);
        if (templateSource) {
          const template = Handlebars.compile(templateSource.innerHTML);
          app.innerHTML = template(data);
      
          // Attach event listener for "Return to Main Menu" button if it exists
          const returnHomeButton = document.getElementById("return-home-button");
          if (returnHomeButton) {
            returnHomeButton.addEventListener("click", loadHome);
          }
          
          console.log(`Template "${templateId}" rendered successfully`);
        } else {
          console.error(`Template with ID "${templateId}" not found.`);
        }
      }
      
      
  
      function loadHome() {
        // Reset quiz data and state
        quizData = {};
        score = 0;
        questionNumber = 0;
      
        // Stop the timer if it’s still running
        if (timerInterval) clearInterval(timerInterval);
      
        // Load the home template
        loadTemplate("home-template");
      }
  
    window.loadQuiz = async (quizId) => {
      const response = await fetch(`https://my-json-server.typicode.com/samihara/project03/quizzes/${quizId}`);
      quizData = await response.json();
      score = 0;
      questionNumber = 0;
      startTimer();
      loadNextQuestion();
    };
  
    function loadNextQuestion() {
      if (questionNumber >= quizData.questions.length) {
        endQuiz();
      } else {
        const currentQuestion = quizData.questions[questionNumber];
        loadTemplate("quiz-template", {
          title: quizData.title,
          questionNumber: questionNumber + 1,
          currentQuestion,
          elapsedTime: Math.floor((Date.now() - startTime) / 1000)
        });
      }
    }
  
    window.checkAnswer = (answer) => {
        const currentQuestion = quizData.questions[questionNumber];
        const correctAnswer = currentQuestion.answer;
        const explanation = currentQuestion.explanation;
        const feedback = document.getElementById("feedback");
      
        if (answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
          feedback.textContent = "Correct!";
          score++;
          setTimeout(() => {
            questionNumber++;
            loadNextQuestion();
          }, 1000);
        } else {
          feedback.innerHTML = `Incorrect. The correct answer is: ${correctAnswer}. ${explanation}`;
          // Add "Got it" button for user to acknowledge the explanation
          feedback.innerHTML += ` <button id="got-it-button">Got it</button>`;
          
          // Add event listener for the "Got it" button
          const gotItButton = document.getElementById("got-it-button");
          gotItButton.addEventListener("click", () => {
            questionNumber++;
            loadNextQuestion();
          });
        }
      };
      
  
    function endQuiz() {
      const pass = (score / quizData.questions.length) * 100 >= 80;
      clearInterval(timerInterval); // Stop the timer at the end
      loadTemplate("end-template", {
        message: pass ? "Congratulations" : "Sorry",
        username: document.getElementById("username") ? document.getElementById("username").value : "Player",
        score: score,
        totalQuestions: quizData.questions.length,
        elapsedTime: Math.floor((Date.now() - startTime) / 1000)
      });
    }
  
    loadHome();
  });
  