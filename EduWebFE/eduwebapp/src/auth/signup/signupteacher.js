import React, { useContext, useRef, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import { Link, useNavigate } from "react-router-dom";
import mycontext from "../../configs/mycontext";
import { GoogleLogin } from "@react-oauth/google";
import cookie from "react-cookies";
import { Noti } from "../../components/common/modal/modal";

const SignUpTeacher = () => {
  const fields = [
    {
      label: "First name",
      type: "text",
      field: "first_name",
    },
    {
      label: "Last name",
      type: "text",
      field: "last_name",
    },
    {
      label: "Username",
      type: "text",
      field: "username",
    },
    {
      label: "Password",
      type: "password",
      field: "password",
    },
    {
      label: "Confirm password",
      type: "password",
      field: "confirm",
    },
    {
      label: "Email",
      type: "email",
      field: "email",
    },
    {
      label: "Phone number",
      type: "text",
      field: "phoneNumber",
    },
    {
      label: "Qualification",
      type: "text",
      field: "qualification",
    },
  ];

  const [muUser, dispatch] = useContext(mycontext);
  const [user, setUser] = useState({ is_teacher: "true" });
  const avatar = useRef();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "",
    message: "",
    isError: false,
  });
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    fields.forEach((f) => {
      if (!user[f.field]) {
        newErrors[f.field] = `Input ${f.label}`;
        isValid = false;
      }
    });
    if (user.confirm !== user.password) {
      newErrors[user.confirm] = "Confirm password is incorrect";
      isValid = false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailPattern.test(user.email)) {
      newErrors.email = "Email format is wrong";
      isValid = false;
    }

    const phonePattern = /^[0-9]{10,11}$/;
    if (user.phoneNumber && !phonePattern.test(user.phoneNumber)) {
      newErrors.phoneNumber = "Email format is wrong";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const change = (e, field) => {
    setUser((current) => {
      return { ...current, [field]: e.target.value };
    });
  };

  const register = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let form = new FormData();
      for (let key in user) if (key !== "confirm") form.append(key, user[key]);
      if (avatar?.current?.files?.[0]) {
        form.append("avatar", avatar.current.files[0]);
      } else {
        console.info("No image founded");
      }
      try {
        let res = await APIs.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.info(res.data);
        navigate("/login");
      } catch (ex) {
        console.error(ex);
      }
    }
  };

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      let res = await APIs.post(endpoints["gg_register"], {
        token: token,
        is_teacher: "True",
        is_student: "False",
      });
      cookie.save("token", res.data.tokens.access);
      navigate("/checkmail");

      const autoCheck = setInterval(async () => {
        try {
          let u = await authAPI().get(endpoints["current-user"]);
          cookie.save("user", u.data);
          dispatch({
            type: "login",
            payload: u.data,
          });

          navigate("/teawall/course");
          clearInterval(autoCheck);
        } catch (ex) {
          console.error("Please try again");
        }
      }, 3000); //cu 5s kiem tra da active account chua
    } catch (error) {
      console.error(
        "Register Failed",
        error.res ? error.res.data : error.message
      );
    }
  };
  const handleError = () => {
    console.log("Register Failed");
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
              Create your account teacher
            </h3>
            <p className="text-center">to continue</p>
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
            <div className="text-center mb-3">
              <span>or</span>
            </div>
            <Form>
              {fields.map((f) => (
                <Form.Group key={f.field} className="mb-3" controlId={f.field}>
                  <Form.Label className="form-label">{f.label}</Form.Label>
                  <Form.Control
                    onChange={(e) => change(e, f.field)}
                    value={user[f.field]}
                    type={f.type}
                    placeholder={f.label}
                    isInvalid={!!errors[f.field]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[f.field]}
                  </Form.Control.Feedback>
                </Form.Group>
              ))}
              <Form.Group className="mb-3" controlId="avatar">
                <Form.Label className="float-left">Set avatar</Form.Label>
                <Form.Control
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  ref={avatar}
                />
              </Form.Group>
              <Button
                onClick={register}
                style={{ backgroundColor: "#0000FF" }}
                type="submit"
                className="w-100 mt-3"
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
              <p style={{ margin: 0 }}>Have an account? </p>
              <Link to="/login" style={{ color: "#0000FF", marginLeft: "5px" }}>
                Sign in
              </Link>
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

export default SignUpTeacher;
