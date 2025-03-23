import React, { useEffect, useState } from "react";
import { authAPI, endpoints } from "../../../../configs/APIs";
import { useParams } from "react-router-dom";
export const ExamDetail = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [exam, setExam] = useState(null);
  const { id } = useParams();
  console.log(id);

  const getExam = async () => {
    const response = await authAPI().get(endpoints['exam_detail'](id));
    setExam(response.data);
  }
  useEffect(() => {
    getExam();
  }, [id]);

  const handleAnswerSelect = (questionIndex, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerId,
    }));
  };

  const handleSubmit = () => {
    console.log("Submitted answers:", selectedAnswers);
    // Bạn có thể thêm API submit ở đây
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {exam === null ? (
        <p>Loading...</p>
      ) : (
        <>
          {exam.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 border rounded-lg p-4 shadow-sm">
              <h2 className="font-medium mb-3">
                {qIndex + 1}. {question.content}
              </h2>
              <div className="space-y-2">
                {question.answers.map((answer, aIndex) => (
                  <label key={answer.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={answer.id}
                      checked={selectedAnswers[qIndex] === answer.id}
                      onChange={() => handleAnswerSelect(qIndex, answer.id)}
                    />
                    <span>
                      {String.fromCharCode(65 + aIndex)}. {answer.content}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
  
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}  