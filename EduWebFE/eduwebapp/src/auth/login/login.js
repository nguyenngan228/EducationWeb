import React, { useContext, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";
import mycontext from "../../configs/mycontext";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import qs from "qs";
import { useNavigate } from "react-router-dom";
import cookie from "react-cookies";
import { GoogleLogin } from "@react-oauth/google";
import { Noti } from "../../components/common/modal/modal";

const Login = () => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [user, dispatch] = useContext(mycontext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "",
    message: "",
    isError: false,
  });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    if (!username) {
      newErrors.username = "Input username";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Input password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleShowErrorModal = () => {
    setModalProps({
      title: "Oops",
      message: "Username or password incorrect",
      isError: true,
    });
    setShowModal(true);
  };

  const login = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let res = await APIs.post(
          endpoints["login"],
          qs.stringify({
            username: username,
            password: password,
            client_id: process.env.REACT_APP_CLIENT_ID_AUTH,
            client_secret: process.env.REACT_APP_CLIENT_SECRET,
            grant_type: "password",
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        cookie.save("token", res.data.access_token);
        let u = await authAPI().get(endpoints["current-user"]);
        cookie.save("user", u.data);
        dispatch({
          type: "login",
          payload: u.data,
        });
        if (u.data.is_teacher) navigate("/teawall");
        else if (u.data.is_student) navigate("/stuwall");
      } catch (ex) {
        console.error(ex);
        handleShowErrorModal();
      }
    }
  };
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      let res = await APIs.post(endpoints["gg_login"], {
        token: token,
      });
      cookie.save("token", res.data.tokens.access);
      let u = await authAPI().get(endpoints["current-user"]);
      cookie.save("user", u.data);
      dispatch({
        type: "login",
        payload: u.data,
      });
      if (u.data.is_teacher) {
        navigate("/teawall/course");
      } else if (u.data.is_student) {
        navigate("/stuwall/dashboard");
      }
    } catch (error) {
      handleShowErrorModal();
    }
  };
  const handleError = () => {
    console.log("Login Failed");
  };


  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100">
        <Col md={4} className="mx-auto">
          <div className="card p-4 shadow-lg login-card">
            <h3 className="text-center mb-3" style={{ fontWeight: "bold" }}>
              Sign in
            </h3>
            <p className="text-center">to continue</p>
            <div className="text-center mb-3">
              <span>or</span>
            </div>
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text="continue_with"
                size="large"
                shape="rectangular"
                logo_alignment="left"
                locale="en"
              />
            </div>

            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label className="form-label">Username</Form.Label>
                <Form.Control
                  style={{ height: "30px" }}
                  value={username}
                  onChange={(t) => setUsername(t.target.value)}
                  type="email"
                  isInvalid={!!errors.username}
                  autoComplete="username"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Label className="form-label">Password</Form.Label>
                <Form.Control
                  style={{ height: "30px" }}
                  value={password}
                  onChange={(t) => setPassword(t.target.value)}
                  type="password"
                  isInvalid={!!errors.password}
                  autoComplete="current-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                onClick={login}
                style={{ backgroundColor: "#0000FF",height: "30px", fontSize: "15px" }}
                type="submit"
                className="w-100 mt-4"
              >
                Continue
              </Button>
            </Form>
            <div
              className="text-center mt-3"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p style={{ margin: 0 }}>No account? </p>
              <a href="/role" style={{ color: "#0000FF", marginLeft: "5px" }}>
                Sign up
              </a>
            </div>
          </div>
        </Col>
      </Row>
      <Noti
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalProps.title}
        message={modalProps.message}
        isError={modalProps.isError}
      />
    </Container>
  );
};

export default Login;
