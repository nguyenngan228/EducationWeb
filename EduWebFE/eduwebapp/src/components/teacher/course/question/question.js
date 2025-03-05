import { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { Form } from "react-router-dom";

export const Question=(onAddQuestion)=>{
    const [questionText, setQuestionText] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const videoRef = useRef(null);
  
    const handleAddQuestion = () => {
      if (questionText && timestamp) {
        onAddQuestion({ questionText, timestamp });
        setQuestionText('');
        setTimestamp('');
      }
    };
  
    const updateTimestamp = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        setTimestamp(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };
  
    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
        <Form.Group controlId="formQuestionText">
          <Form.Label>Question</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formTimestamp">
          <Form.Label>Timestamp</Form.Label>
          <Form.Control
            type="text"
            placeholder="Timestamp will appear here"
            value={timestamp}
            readOnly
          />
          <Button
            className="mt-2"
            style={{ backgroundColor: '#000', color: '#fff' }}
            onClick={updateTimestamp}
          >
            Get Current Time
          </Button>
        </Form.Group>
        <Button
          className="mt-2"
          style={{ backgroundColor: '#000', color: '#fff' }}
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
        <video ref={videoRef} controls style={{ display: 'none' }}>
          {/* URL video should be provided here */}
          <source src="path_to_your_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
}