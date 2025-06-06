import { Form, useAsyncError, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { authAPI, endpoints } from "../../../../../configs/APIs";
import Banner from "../banner/banner";
import './chapterDetail.css';
import { Button, Modal, Offcanvas } from 'react-bootstrap';
import mycontext from "../../../../../configs/mycontext";
import { ChapterProgressButton } from "../chapterProgressButton/chapterProgressButton";
import confetti from 'canvas-confetti';
import GeminiChat from "../../../chatGemini/chatGemini";
import { YouTubePlayer } from "../../../../common/player/ytPlayer";


export const ChapterDetail = () => {
    const { id, chapterid } = useParams();
    const [chapter, setChapter] = useState(null);
    const [user] = useContext(mycontext)
    const [listNotes, setListNotes] = useState(null)
    const [note, setNote] = useState(null)
    const [currentNote, setCurrentNote] = useState(null);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const nav = useNavigate();
    const [showNotes, setShowNotes] = useState(false)
    const [showAddNote, setShowAddNote] = useState(false);
    const [question, setQuestion] = useState(null)
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [showQuestion, setShowQuestion] = useState(false);
    const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const playerRef = useRef(null);


    const showConfetti = () => {
        confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.6 }
        });
    };
    const loadQuestion = async () => {
        try {
            let res = await authAPI().get(endpoints['get_question'](chapterid))
            setQuestion(res.data)
        } catch (ex) { console.error(ex) }
    }
    useEffect(() => {
        if (chapterid) {
            loadQuestion()
        }
    }, [chapterid])
    useEffect(() => {
        if (!question || !Array.isArray(question)) return;

        const matched = question.find(q =>
            Math.abs(q.timestamp - videoCurrentTime) < 1 &&
            q.id !== currentQuestion?.id
        );

        if (matched) {
            playerRef.current?.pause();
            setCurrentQuestion(matched);
            setShowQuestion(true);
        }
    }, [videoCurrentTime, question]);

    const loadNotes = async () => {
        try {
            let res = await authAPI().get(endpoints['get_notes'](chapterid))
            setListNotes(res.data)
        } catch (ex) { console.error(ex) }
    }

    const addNote = async () => {
        try {
            await authAPI().post(endpoints['add_note'](chapterid), {
                'content': note,
                'timestamp': videoCurrentTime
            });
            setNote('');
            setShowAddNote(false);
            loadNotes();
        } catch (ex) { console.error(ex) }
    }

    const loadChapter = async () => {
        const url = `${chapterid}/?course_id=${id}`;
        try {
            let res = await authAPI().get(endpoints['get_chapter_detail'](url));
            setChapter(res.data);
            loadNotes()

        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        if (chapterid) {
            loadChapter();
        }
    }, [chapterid]);
    const videoId = chapter?.chapter?.video;

    const payment = async (e) => {
        e.preventDefault()
        try {
            let res = await authAPI().post(endpoints['payment'], {
                "student": user.id,
                "course": chapter.course.id
            })
            const payload = {
                student: user.id,
                course: chapter.course.id
            };
            console.log("Payload gửi đi:", payload);
            window.location.href = res.data.url;
        } catch (ex) { console.error(ex) }

    }
    const handleProgressClick = async () => {

        try {
            let res = await authAPI().put(endpoints['completed'](chapter.chapter.id), {
                'is_completed': !chapter.userProgress?.is_completed
            });


            if (!chapter.userProgress?.is_completed) {
                if (!chapter.nextChapter) {
                    showConfetti();
                } else {
                    nav(`/stuwall/course/${chapter.course.id}/chapter/${chapter.nextChapter.id}`);
                }
            }
            window.location.reload()

        } catch (ex) {
            console.error(ex);
        }
    };
    // Notes
    const handleShowNotes = () => setShowNotes(true);
    const handleCloseNotes = () => setShowNotes(false);
    const handleShowAddNote = () => {
        playerRef.current?.pause();
        setShowAddNote(true);
    };
    const handleCloseAddNote = () => setShowAddNote(false);

    const handleNoteClick = (timestamp) => {
        if (playerRef.current) {
            playerRef.current.seekTo(timestamp);
        }
        setShowNotes(false);
    };

    // Questtion
    const handleQuestionSubmit = (answerId) => {
        if (currentQuestion.correct_answer === answerId) {
            showConfetti();
        } else {
            setCorrectAnswer(currentQuestion.list_answers.find(a => a.id === currentQuestion.correct_answer).answer);
            setShowCorrectAnswerModal(true);
        }
        setShowQuestion(false);
        if (playerRef.current?.playVideo) {
            playerRef.current.playVideo();
        }
    };

    return (
        <div className="chapter-container">
            <div className="content">
                {chapter ? (
                    chapter.chapter ? (
                        chapter.purchase !== null ? (
                            <div>
                                <div className="video-container">
                                    <YouTubePlayer
                                        ref={playerRef}
                                        videoUrl={chapter.chapter.video}
                                        onEnded={handleProgressClick}
                                        onTimeUpdate={setVideoCurrentTime}
                                    />
                                    {showQuestion && currentQuestion && (
                                        <div className="overlay">
                                            <div className="question-modal">
                                                <h4>{currentQuestion.question}</h4>
                                                {currentQuestion.list_answers.map((answer, idx) => (
                                                    <Button key={idx} onClick={() => handleQuestionSubmit(answer.id)}>{answer.answer}</Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Modal show={showCorrectAnswerModal} onHide={() => setShowCorrectAnswerModal(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Correct answer</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        Correct answer is: {correctAnswer}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowCorrectAnswerModal(false)}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>


                                <div>
                                    <div className="container button-container">
                                        <h2 className="chapter-title">{chapter.chapter.title}</h2>
                                        <div className="button-group">
                                            <Button className="notes-button" onClick={handleShowNotes}>Notes</Button>
                                            <Button
                                                className="add-note-button"
                                                onClick={handleShowAddNote}
                                            >
                                                Add note at {Math.floor(videoCurrentTime / 60)}:{Math.floor(videoCurrentTime % 60)}
                                            </Button>
                                        </div>
                                    </div>


                                    <Offcanvas show={showNotes} onHide={handleCloseNotes} placement="end">
                                        <Offcanvas.Header closeButton>
                                            <Offcanvas.Title>My Notes</Offcanvas.Title>
                                        </Offcanvas.Header>
                                        <Offcanvas.Body>
                                            {listNotes !== null ? (
                                                listNotes.map((note, idx) => (
                                                    <div key={idx} onClick={() => handleNoteClick(note.timestamp)}>
                                                        <strong>{Math.floor(note.timestamp / 60)}:{Math.floor(note.timestamp % 60)}</strong> - {note.content}
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No notes available.</p>
                                            )}
                                        </Offcanvas.Body>
                                    </Offcanvas>
                                    <Offcanvas show={showAddNote} onHide={handleCloseAddNote} placement="bottom">
                                        <Offcanvas.Header closeButton>
                                            <Offcanvas.Title>Add Note</Offcanvas.Title>
                                        </Offcanvas.Header>
                                        <Offcanvas.Body>
                                            <textarea
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Enter your note"
                                                style={{
                                                    width: '100%',
                                                    height: '100px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '5px',
                                                    resize: 'vertical',
                                                }}
                                            />
                                            <Button style={{ backgroundColor: 'black' }} onClick={addNote}>Submit</Button>
                                        </Offcanvas.Body>
                                    </Offcanvas>
                                </div>

                            </div>

                        ) : (
                            <div>
                                <YouTubePlayer
                                    videoUrl={chapter.chapter.video}
                                    onEnded={handleProgressClick}
                                />
                                <div className="title-and-button">
                                    <h2 className="chapter-title">{chapter.chapter.title}</h2>
                                    <Button type="button" onClick={payment} style={{ backgroundColor: "#211414", color: "white" }}>
                                        Enroll with ${chapter.course.price}
                                    </Button>
                                </div>
                            </div>
                        )
                    ) : (
                        <Banner message="You need to purchase this course to watch this chapter." isSuccess={false} />
                    )
                ) : (
                    <Banner message="Loading..." isSuccess={false} />
                )}

            </div>
            {videoId && <GeminiChat videoId={videoId} />}
        </div>
    )
};
const extractVideoId = (url) => {
    const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};