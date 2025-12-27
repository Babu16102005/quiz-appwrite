import { useEffect, useState } from "react";
import {
  databases,
  account,
  client,
  DATABASE_ID,
  QUESTIONS_COLLECTION_ID,
  SCORES_COLLECTION_ID
} from "./appwrite";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 'A', 1: 'C' }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    databases
      .listDocuments(DATABASE_ID, QUESTIONS_COLLECTION_ID)
      .then((res) => {
        if (isMounted) setQuestions(res.documents);
      });

    // Real-time subscription
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${QUESTIONS_COLLECTION_ID}.documents`,
      (response) => {
        if (isMounted && response.events.includes("databases.*.documents.create")) {
          setQuestions((prev) => [...prev, response.payload]);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleOptionClick = (questionIndex, option) => {
    // Logic: First click only considerable. If already selected, do nothing.
    // Also block if already submitted.
    if (isSubmitted || selectedAnswers[questionIndex]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const calculateScore = () => {
    let currentScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctOption) {
        currentScore += 1;
      }
    });
    return currentScore;
  };

  const submitQuiz = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);

    try {
      const user = await account.get();
      await databases.createDocument(
        DATABASE_ID,
        SCORES_COLLECTION_ID,
        "unique()",
        {
          userId: user.email,
          score: finalScore,
          // You could also save which answers they selected if you added that schema to Appwrite
        }
      );
      // Removed the alert for a smoother UI experience, result is shown on screen
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  // Helper to determine button class
  const getOptionClass = (q, option, index) => {
    let classes = "option-btn";
    const isSelected = selectedAnswers[index] === option;

    if (isSubmitted) {
      // Review Mode
      if (q.correctOption === option) {
        return classes + " correct"; // Always highlight correct answer
      }
      if (isSelected && q.correctOption !== option) {
        return classes + " wrong"; // Highlight wrong selection
      }
      return classes + " dimmed"; // Dim others
    } else {
      // Active Quiz Mode
      if (isSelected) return classes + " selected";
    }
    return classes;
  };

  return (
    <div className="card">
      <div className="quiz-header">
        <h2>Quiz Challenge</h2>
        {isSubmitted && <span className="score-badge">Final Score: {score} / {questions.length}</span>}
      </div>

      {isSubmitted && (
        <div className="result-summary">
          <h2>{score > questions.length / 2 ? "🎉 Great Job!" : "📚 Keep Practicing!"}</h2>
          <p>You scored {score} out of {questions.length}</p>
        </div>
      )}

      {questions.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>Loading questions or no questions available...</p>
      ) : (
        <div className="quiz-content">
          {questions.map((q, index) => (
            <div key={index} className="question-block">
              <h3>{index + 1}. {q.question}</h3>
              <div className="options-grid">
                {["A", "B", "C", "D"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(index, opt)}
                    className={getOptionClass(q, opt, index)}
                    disabled={isSubmitted || (!isSubmitted && selectedAnswers[index] && selectedAnswers[index] !== opt)}
                  >
                    {opt}: {q[`option${opt}`]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!isSubmitted && (
            <button
              className="submit-btn"
              onClick={submitQuiz}
              disabled={Object.keys(selectedAnswers).length === 0}
            >
              Submit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Quiz;
