import React, { useContext, useRef, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import { Link, useNavigate } from "react-router-dom";
import cookie from "react-cookies";
import { GoogleLogin } from "@react-oauth/google";
import mycontext from "../../configs/mycontext";
import { Noti } from "../../components/common/modal/modal";

const SignUpStudent = () => {
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

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirm: "",
    email: "",
    phoneNumber: "",
    qualification: "",
    is_student: "true",
    is_teacher: "false",
  });
  const avatar = useRef();
  const [myuser, dispatch] = useContext(mycontext);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "",
    message: "",
    isError: false,
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((f) => {
      if (!user[f.field]) {
        newErrors[f.field] = `Input ${f.label}`;
        isValid = false;
      }
    });

    if (user.password !== user.confirm) {
      newErrors.confirm = "Password is incorrect";
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

  const handleShowErrorModal = () => {
    setModalProps({
      title: "Oops",
      message: "Network is not working",
      isError: true,
    });
    setShowModal(true);
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
      for (let key in user)
        if (key !== "confirm") {
          form.append(key, user[key]);
        }

      if (avatar?.current?.files?.[0]) {
        form.append("avatar", avatar.current.files[0]);
      } else {
        alert("No picture founded");
      }
      try {
        let res = await APIs.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        navigate("/checkmail");
        // console.log(res.data)
        // cookie.save("token", res.data.tokens.access)

        cookie.save("user", res.data);
        dispatch({
          type: "login",
          payload: res.data,
        });
        navigate("/interest-cate", { state: { userId: res.data.id } });
      } catch (ex) {
        alert(ex);
        handleShowErrorModal();
      }
    }
  };
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      let res = await APIs.post(endpoints["gg_register"], {
        token: token,
        is_teacher: "False",
        is_student: "True",
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
          navigate("/interest-cate", { state: { userId: u.data.id } });
          clearInterval(autoCheck);
        } catch (ex) {
          console.error("Please try again");
        }
      }, 3000);
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
          <div className="card px-8 py-12 shadow-lg login-card">
            <h3
              className="text-center mb-3 font-medium text-4xl"
              style={{ fontWeight: "bold" }}
            >
              Create an account
            </h3>
            <p className="text-center text-2xl">
              Create your account instantly and enjoy our best online courses.
            </p>
            <div className="text-center mb-4 text-2xl">
              <span>or</span>
            </div>
            <div className="google-login-container w-full">
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
              {fields.map((f) => (
                <Form.Group key={f.field} className="mb-3" controlId={f.field}>
                  <Form.Label className="form-label text-2xl">
                    {f.label}
                  </Form.Label>
                  <Form.Control
                    className="form-input"
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

export default SignUpStudent;
