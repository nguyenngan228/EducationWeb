import React, { useEffect, useState } from "react";
import { authAPI, endpoints } from "../../../../configs/APIs";
import { useParams } from "react-router-dom";
import { Noti } from "../../../common/modal/modal";

export const ExamDetail = () => {
  const [answers, setAnswers] = useState([]);
  const [exam, setExam] = useState(null);
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "",
    message: "",
    isError: false,
  });

  const getExam = async () => {
    try {
      const response = await authAPI().get(endpoints['exam_detail'](id));
      setExam(response.data);
    } catch (error) {
      console.error("Lỗi khi tải đề thi:", error);
    }
  };

  useEffect(() => {
    getExam();
  }, [id]);

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => {
      const existing = prev.find(ans => ans.question_id === questionId);
      if (existing) {
        // Update
        return prev.map(ans =>
          ans.question_id === questionId ? { ...ans, answer_id: answerId } : ans
        );
      } else {
        // Add new
        return [...prev, { question_id: questionId, answer_id: answerId }];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        exam_id: exam.id,
        answers: answers
      };

      console.log("Payload gửi:", payload);

      const response = await authAPI().post(endpoints['submit_exam'], payload);

      setModalProps({
        title: "Nộp bài thành công",
        message: `Điểm của bạn: ${response.data.score}`,
        isError: false,
      });
      setShowModal(true);
    } catch (error) {
      setModalProps({
        title: "Lỗi",
        message: "Có lỗi xảy ra khi nộp bài!",
        isError: true,
      });
      setShowModal(true);
    }
  };

  const isChecked = (questionId, answerId) => {
    const found = answers.find(ans => ans.question_id === questionId);
    return found?.answer_id === answerId;
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {exam === null ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">{exam.title}</h2>
          {exam.questions.map((question, index) => (
            <div key={question.id} className="mb-4 p-3 border rounded">
              <h3 className="font-medium mb-2">
                {index + 1}. {question.content}
              </h3>
              {question.answers.map(answer => (
                <div key={answer.id} className="flex items-center mb-1">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={answer.id}
                    checked={isChecked(question.id, answer.id)}
                    onChange={() => handleAnswerSelect(question.id, answer.id)}
                    className="mr-2"
                  />
                  <label>{answer.content}</label>
                </div>
              ))}
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
      <Noti
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalProps.title}
        message={modalProps.message}
        isError={modalProps.isError}
      />
    </div>
  );
};
