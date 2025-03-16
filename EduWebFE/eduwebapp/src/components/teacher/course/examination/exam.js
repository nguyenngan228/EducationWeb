import React, { useState, useRef } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { authAPI, endpoints } from '../../../../configs/APIs';
import { useNavigate, useParams } from 'react-router-dom';


export const Exam = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let res = await authAPI().post(endpoints['create_exam'](id), {
                title: title,
                description: description,
                course: id
            });
            navigate(`/teawall/course/${id}/edit_course`);
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
                    <div className="chapter-title">
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter exam title"
                        />
                    </div>
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

                <div>
                    <Button style={{ backgroundColor: "black", color: "white" }} className="save-button" disabled={isLoading} onClick={handleSave}>
                        {isLoading ? <Spinner animation="border" role="status" /> : "Save"}
                    </Button>
                </div>
            </Form>
        </div>
    );
};