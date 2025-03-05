import React, { useReducer } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./auth/login/login";
import MyUserReducer from "./reducers/myusereducer";
import Mycontext from "./configs/mycontext";
import Selectrole from "./auth/role/selectrole";
import SignUpTeacher from "./auth/signup/signupteacher";
import SignUpStudent from "./auth/signup/signupstudent";
import Layout from "./components/common/layout";
import AddCourse from "./components/teacher/course/course";
import { Chapter } from "./components/teacher/course/chapter/chapter";
import MyCourse from "./components/teacher/dashboard/mycourse";
import EditCourse from "./components/teacher/course/editCourse/editCourse";
import { Profile } from "./components/teacher/profile/profile";
import cookie from "react-cookies";
import { EditChapter } from "./components/teacher/course/editChapter/editChapter";
import { StudentDashBoard } from "./components/student/dashboard/dashboard";
import { CourseDetail } from "./components/student/course/courseDetail/courseDetail";
import { ChapterDetail } from "./components/student/course/chapter/chapterDetail/chapterDeatil";
import PaymentSuccess from "./components/student/actions/status/success";
import PaymentCancel from "./components/student/actions/status/fail";
import { MyLearning } from "./components/student/mycourse/MyLearning";
import { AnalystPage } from "./components/teacher/analytics/analyst";
import { InterestCate } from "./auth/interesting_cate/interesting_cate";
import { CheckMail } from "./auth/signup/checkMail";
import { MembersOfCourse } from "./components/teacher/course/members/members";
import { Instructor } from "./components/student/course/instructor/instructor";
import { Active } from "./auth/signup/active";
import { CartProvider } from "./configs/mycartcontext";
import { Cart } from "./components/student/cart/cart";
import { CourseDashboard } from "./components/user/dashboard/courseDashboard";

const App = () => {
  const [user, dispatch] = useReducer(
    MyUserReducer,
    cookie.load("user") || null
  );
  return (
    <Mycontext.Provider value={[user, dispatch]}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signupteacher" element={<SignUpTeacher />} />
            <Route path="/signupstudent" element={<SignUpStudent />} />
            <Route path="/checkmail" element={<CheckMail />} />
            <Route path="/active" element={<Active />} />

            <Route path="interest-cate" element={<InterestCate />} />
            <Route path="/role" element={<Selectrole />} />
            <Route path="/teawall" element={<Layout />}>
              <Route index element={<Navigate to="/teawall/course" />} />
              <Route path="course" element={<MyCourse />} />
              <Route path="course/add" element={<AddCourse />} />
              <Route path="course/:id/edit_course" element={<EditCourse />} />
              <Route
                path="course/:id/member_course"
                element={<MembersOfCourse />}
              />
              <Route path="analyst" element={<AnalystPage />} />
              <Route path="course/:id/add_chapter" element={<Chapter />} />
              <Route
                path="course/:id/edit_chapter/:chapterId"
                element={<EditChapter />}
              />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/stuwall" element={<Layout />}>
              <Route index element={<Navigate to="/stuwall/dashboard" />} />
              <Route path="dashboard" element={<StudentDashBoard />} />
              <Route path="user-dashboard" element={<CourseDashboard />} />
              <Route path="cart" element={<Cart />} />
              <Route path="course/:id" element={<CourseDetail />}>
                <Route path="chapter/:chapterid" element={<ChapterDetail />} />
              </Route>
              <Route path="my-course" element={<MyLearning />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/cancel" element={<PaymentCancel />} />
            <Route path="/profile_teacher" element={<Instructor />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </Mycontext.Provider>
  );
};

export default App;
