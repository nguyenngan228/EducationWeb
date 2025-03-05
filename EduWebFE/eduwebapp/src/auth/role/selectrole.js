import React, { useContext, useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';


const SelectRole=()=>{
    const navigate = useNavigate()
    const selectTeacher=(e)=>{
        navigate('/signupteacher')
    }
    const selectStudent=(e)=>{
        navigate('/signupstudent')
    }
    return(
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={4} className="mx-auto">
                    <div className="card p-4 shadow-lg login-card"> {/* Add shadow-lg class for shadow */}
                        <h3 className="text-center mb-3" style={{fontWeight: 'bold'}}>Select role</h3>
                        <p className="text-center">to continue</p>
                        <Button onClick={selectTeacher} variant="outline-dark" className="w-100 mb-3">
                            Teacher
                        </Button>
                        <div className="text-center mb-3">
                            <span>or</span>
                        </div>
                        <Button onClick={selectStudent} variant="outline-dark" className="w-100 mb-3">
                            Student
                        </Button>
                        
                        <div className="text-center mt-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ margin: 0 }}>Have an account? </p>
                            <a href="/login" style={{ color: '#0000FF', marginLeft: '5px' }}>Sign in</a>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    )
    
}
export default SelectRole;