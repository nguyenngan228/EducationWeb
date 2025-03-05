import { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, endpoints } from '../../../../configs/APIs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { ArrowUpLeft, Pencil } from 'lucide-react';

export const EditChapter = () => {
  const { id, chapterId } = useParams()
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [is_free, setIsFreePreview] = useState(false);
  const [position, setPosition] = useState('');
  const [video, setVideo] = useState();
  const videoInputRef = useRef();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingIsFreePreview, setIsEditingIsFreePreview] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([{ answer: '', is_correct: false }]);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const loadInitialChapter = async () => {
    try {
      const url = `${chapterId}/?course_id=${id}`
      let res = await authAPI().get(endpoints['get_chapter_detail'](url));
      setTitle(res.data.chapter.title);
      setDescription(res.data.chapter.description);
      setIsFreePreview(res.data.chapter.is_free);
      setPosition(res.data.chapter.position);
      setVideo(res.data.chapter.video);
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    loadInitialChapter();
  }, [id]);

  const updateChapter = async () => {
    let form = new FormData();
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (is_free) updatedFields.is_free = is_free ? 'True' : 'False';
    if (description) updatedFields.description = description;
    if (videoInputRef.current && videoInputRef.current.files[0]) {
      updatedFields.video = videoInputRef.current.files[0];
    }
    for (let key in updatedFields) {
      form.append(key, updatedFields[key]);
    }

    try {
      let res = await authAPI().patch(endpoints['update_chapter'](chapterId), form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/teawall/course/${id}/edit_chapter/${chapterId}`);
    } catch (ex) {
      console.error(ex);
    }
  };
  const backToCourse = () => {
    navigate(`/teawall/course/${id}/edit_course`)
  }

  const handleAnswerChange = (index, event) => {
    const updatedAnswers = [...answers];
    if (event.target.name === 'is_correct') {
      updatedAnswers.forEach((answer, i) => {
        updatedAnswers[i].is_correct = i === index ? event.target.checked : false;
      });
    } else {
      updatedAnswers[index][event.target.name] = event.target.value;
    }
    setAnswers(updatedAnswers);
  };

  const addAnswerField = () => {
    if (answers.length < 4) {
      setAnswers([...answers, { answer: '', is_correct: false }]);
    } else {
      alert('You can only add up to 4 answers.');
    }
  };

  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    setVideoCurrentTime(currentTime);

  };
  const addQuestion = async () => {
    try {
      let res = await authAPI().post(endpoints['add_question'](chapterId), {

        "question": question,
        "timestamp": videoCurrentTime,
        "answers": answers

      })
      console.info(res.data)
    } catch (ex) { console.error(ex) }
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-y-2'>
          <h1 className='text-2xl font-medium'>Edit chapter</h1>
          <Button className="p-0 d-flex align-items-center text-dark bg-transparent border-0" type='button' onClick={backToCourse}
          >
            <ArrowUpLeft className="me-1" size={20} />
            <p>Back to edit course</p>
          </Button>

        </div>
      </div>
      <div className='container-fluid mt-16'>
        <Form>
          <Row className="no-gutters">

            <Col md={6}>
              <div className="course-title-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Course title</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                  >
                    <Pencil className="me-1" /> {isEditingTitle ? 'Cancel' : 'Edit Title'}
                  </Button>
                </div>

                {isEditingTitle ? (
                  <Form.Group controlId="formCourseTitle" className="mb-3">
                    <Form.Control
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      type="text"
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateChapter();
                        setIsEditingTitle(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                ) : (
                  <p style={{ fontSize: '18px', marginBottom: '0' }}>{title}</p>
                )}
              </div>
              {/* ---------- */}
              <div className="course-title-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Description</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                  >
                    <Pencil className="me-1" /> {isEditingDescription ? 'Cancel' : 'Edit Title'}
                  </Button>
                </div>

                {isEditingDescription ? (
                  <Form.Group controlId="formCourseTitle" className="mb-3">
                    <Form.Control
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      type="text"
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateChapter();
                        setIsEditingDescription(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                ) : (
                  <p style={{ fontSize: '18px', marginBottom: '0' }}>{description}</p>
                )}
              </div>

              <Form.Group className="chapter-section full-width">
                <Form.Label>Access Settings</Form.Label>
                <div className="access-settings">
                  <Form.Check
                    type="checkbox"
                    id="free-preview-checkbox"
                    label="Free Preview Chapter"
                    checked={is_free}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    disabled={!isEditingIsFreePreview}
                  />
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    if (isEditingIsFreePreview) {
                      updateChapter();
                    }
                    setIsEditingIsFreePreview(!isEditingIsFreePreview);
                  }}
                >
                  {isEditingIsFreePreview ? 'Done' : 'Edit'}
                </Button>

              </Form.Group>


            </Col>
            <Col md={6}>
              <Form.Group className="chapter-section">
                <Form.Label>Chapter video</Form.Label>
                {video && !isEditingVideo && (
                  <div className="video-preview">
                    <video src={video} controls onTimeUpdate={handleTimeUpdate} />
                  </div>
                )}
                {isEditingVideo && (
                  <div className="chapter-video" onClick={() => videoInputRef.current.click()}>
                    <FontAwesomeIcon icon={faVideo} size="2x" />
                    <span>Add a video</span>
                    {videoInputRef.current && videoInputRef.current.files[0] && (
                      <div className="video-preview">
                        <video src={URL.createObjectURL(videoInputRef.current.files[0])} controls />
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      ref={videoInputRef}
                      accept="video/*"
                      style={{ display: 'none' }}

                    />
                  </div>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    if (isEditingVideo) {
                      updateChapter();
                    }
                    setIsEditingVideo(!isEditingVideo);
                  }}
                  className="mt-2"
                >
                  {isEditingVideo ? 'Done' : 'Edit'}
                </Button>


              </Form.Group>
              <Form.Group className="mt-4">
                <Form.Label>Quiz Question</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter your question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Form.Label className="mt-3">Answers</Form.Label>
                {answers.map((answer, index) => (
                  <div key={index} className="d-flex align-items-center mt-2">
                    <FormControl
                      type="text"
                      name="answer"
                      placeholder={`Answer ${index + 1}`}
                      value={answer.answer}
                      onChange={(e) => handleAnswerChange(index, e)}
                    />
                    <Form.Check
                      className="ms-2"
                      type="checkbox"
                      name="is_correct"
                      label="Correct?"
                      checked={answer.is_correct}
                      onChange={(e) => handleAnswerChange(index, e)}
                    />
                  </div>
                ))}
                <Button variant="outline-secondary" className="mt-2" onClick={addAnswerField}>
                  Add another answer
                </Button>

              </Form.Group>
              <Button
                variant="primary"
                className="mt-2"
                onClick={addQuestion}
              >
                Add question at: {Math.floor(videoCurrentTime / 60)}:{Math.floor(videoCurrentTime % 60)}
              </Button>
            </Col>
          </Row>
        </Form>

      </div>
    </div>
  );
};
