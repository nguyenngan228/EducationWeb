import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { authAPI, endpoints } from '../../../../configs/APIs';
import { useNavigate, useParams } from 'react-router-dom';

export const Exam = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const [questions, setQuestions] = useState([]);

    const addQuestion = () => {
        setQuestions([...questions, {
            question_text: '',
            answers: [{ content: '', is_correct: false }]
        }]);
    };

    const removeQuestion = (index) => {
        let updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
    };

    const handleQuestionChange = (index, value) => {
        let updated = [...questions];
        updated[index].question_text = value;
        setQuestions(updated);
    };

    const addAnswer = (qIndex) => {
        let updated = [...questions];
        updated[qIndex].answers.push({ content: '', is_correct: false });
        setQuestions(updated);
    };

    const removeAnswer = (qIndex, aIndex) => {
        let updated = [...questions];
        updated[qIndex].answers.splice(aIndex, 1);
        setQuestions(updated);
    };

    const handleAnswerChange = (qIndex, aIndex, value) => {
        let updated = [...questions];
        updated[qIndex].answers[aIndex].content = value;
        setQuestions(updated);
    };

    const setCorrectAnswer = (qIndex, aIndex) => {
        let updated = [...questions];
        updated[qIndex].answers = updated[qIndex].answers.map((ans, idx) => ({
            ...ans,
            is_correct: idx === aIndex
        }));
        setQuestions(updated);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formattedQuestions = questions.map(q => ({
            content: q.question_text, // đổi key
            answers: q.answers.map(a => ({
                content: a.content, // giữ nguyên vì bạn đã đặt đúng
                is_correct: a.is_correct
            }))
        }));
    
        const data = {
            title: title,
            description: description,
            course: parseInt(id), 
            questions: formattedQuestions
        };
    
    
        try {
            let res = await authAPI().post(endpoints['exam'], data);
            navigate('/teawall/course/');
        } catch (ex) {
            console.error(ex);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chapter-editor">
            <div className="customize-header">
                <h2>Customize your exam</h2>
            </div>
            <Form className="chapter-grid">
                <Form.Group className="chapter-section">
                    <Form.Label style={{ fontWeight: 'bold' }}>Exam title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter exam title"
                    />
                </Form.Group>

                <Form.Group className="chapter-section full-width">
                    <Form.Label>Exam description</Form.Label>
                    <Form.Control
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        as="textarea"
                        style={{ height: '100px' }}
                        placeholder="e.g. This exam includes multiple choice questions..."
                        required
                    />
                </Form.Group>

                <div style={{ marginTop: '20px' }}>
                    <h4>Questions</h4>
                    {questions.map((question, qIndex) => (
                        <div key={qIndex} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
                            <Form.Group>
                                <Form.Label>Question {qIndex + 1}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={question.question_text}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    placeholder="Enter question"
                                />
                            </Form.Group>

                            <Form.Label>Answers:</Form.Label>
                            {question.answers.map((answer, aIndex) => (
                                <div key={aIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <Form.Control
                                        type="text"
                                        value={answer.content}
                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                        placeholder={`Answer ${aIndex + 1}`}
                                    />
                                    <Form.Check
                                        type="radio"
                                        name={`correct-answer-${qIndex}`}
                                        checked={answer.is_correct}
                                        onChange={() => setCorrectAnswer(qIndex, aIndex)}
                                        style={{ marginLeft: '10px' }}
                                    />
                                    <Button variant="danger" size="sm" onClick={() => removeAnswer(qIndex, aIndex)} style={{ marginLeft: '10px' }}>Remove</Button>
                                </div>
                            ))}

                            <Button variant="secondary" size="sm" onClick={() => addAnswer(qIndex)} style={{ marginTop: '10px' }}>Add Answer</Button>
                            <Button variant="danger" size="sm" onClick={() => removeQuestion(qIndex)} style={{ marginLeft: '10px', marginTop: '10px' }}>Remove Question</Button>
                        </div>
                    ))}
                    <Button variant="primary" onClick={addQuestion}>Add Question</Button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <Button style={{ backgroundColor: "black", color: "white" }} disabled={isLoading} onClick={handleSave}>
                        {isLoading ? <Spinner animation="border" role="status" /> : "Save Exam"}
                    </Button>
                </div>
            </Form>
        </div>
    );
};
