import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { Form, Button, Spinner } from 'react-bootstrap';
import './chapter.css';
import { authAPI, endpoints } from '../../../../configs/APIs';
import { useNavigate, useParams } from 'react-router-dom';


export const Chapter = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFreePreview, setIsFreePreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const videoInputRef = useRef(); 
    const navigate = useNavigate();
    const {id}=useParams()
    
    


    const handleSave = async (e) => {
        setIsLoading(true)
        e.preventDefault();
        let form = new FormData();
        form.append('title', title);
        form.append('description', description);
        form.append('is_free',  isFreePreview ? 'True' : 'False');
        
        
        
        if (videoInputRef.current && videoInputRef.current.files[0]) {
            form.append('video', videoInputRef.current.files[0]);
        } else {
            console.info('No video founed');
        }
        try{
            let res = await authAPI().post(endpoints['create_chapter'](id), form,{
                  headers: {
                      'Content-Type': 'multipart/form-data'
                  }
            });
            navigate(`/teawall/course/${id}/edit_course`)
        }catch(ex){
        console.error(ex)
        }finally{
            setIsLoading(false)
        }
    };

    return (
        <div className="chapter-editor">
            <div className="customize-header">
                <h2>Customize your chapter</h2>
            </div>
            <Form className="chapter-grid">
                <Form.Group className="chapter-section">
                    <Form.Label style={{ fontWeight: 'bold' }}>Chapter title</Form.Label>
                    <div className="chapter-title">
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter chapter title"
                        />
                    </div>
                </Form.Group>


                <Form.Group className="chapter-section">
                    <Form.Label>Chapter video</Form.Label>
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
                </Form.Group>

                <Form.Group className="chapter-section full-width">
                    <Form.Label>Chapter description</Form.Label>
                    <Form.Control
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        as="textarea"
                        style={{ height: '100px' }}
                        placeholder="e.g. This chapter is about..."
                        required
                    />
                </Form.Group>

                <Form.Group className="chapter-section full-width">
                    <Form.Label>Access Settings</Form.Label>
                    <div className="access-settings">
                        <Form.Check
                            type="checkbox"
                            id="free-preview-checkbox"
                            label="Free Preview Chapter"
                            checked={isFreePreview}
                            onChange={(e) => setIsFreePreview(e.target.checked)}
                        />
                    </div>
                </Form.Group>
                

                <div>
                    <Button style={{backgroundColor:"black",color:"white"}} className="save-button" disabled={isLoading} onClick={handleSave}>
                        {isLoading?<Spinner animation="border" role="status"/>:"Save"}
                    </Button>
                </div>
            </Form>
        </div>
    );
};
