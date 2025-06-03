import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://127.0.0.1:8000/";
export const endpoints = {
  login: "o/token/",
  "current-user": "users/current_user/",
  register: "users/",
  create_course: "courses/create_course/",
  listCate: "categories/",
  create_chapter: (course_id) => `courses/${course_id}/create_chapter/`,
  my_list_course: (q) => `teachers/get_courses/?q=${q}`,
  get_detail_course: (course_id) => `courses/${course_id}/`,
  update_course: (course_id) => `courses/${course_id}/update_course/`,
  get_chapter_of_course: (course_id) => `courses/${course_id}/get_chapter/`,
  get_chapter_detail: (chapter_id) => `chapters/${chapter_id}`,
  update_chapter: (chapter_id) => `chapters/${chapter_id}/update_chapter/`,
  categories: "categories/",
  courses: (kw) => `courses/${kw}`,
  payment: "purchase/create_checkout_session/",
  payment_success: "purchase/payment_success/",
  completed: (chapter_id) => `userprogress/${chapter_id}/update_progress/`,
  get_courses_of_student: "students/get_courses/",
  get_analytics: "teachers/analytics/",
  update_teacher: (id) => `teachers/${id}/update_teacher/`,
  add_cmt: (courseId) => `courses/${courseId}/comments/`,
  add_rating: (courseId) => `courses/${courseId}/rating/`,
  get_cmt: (courseId) => `courses/${courseId}/get_comments/`,
  get_rating: (courseId) => `courses/${courseId}/get_rating/`,
  add_note: (chapterId) => `chapters/${chapterId}/add_note/`,
  get_notes: (chapterId) => `chapters/${chapterId}/get_notes/`,
  get_question: (chapterId) => `chapters/${chapterId}/get_question/`,
  add_student: (id) => `students/${id}/add_student/`,
  gg_register: "googleauth/register/",
  gg_login: "googleauth/login/",
  get_member: (id) => `purchase/get_student/?course_id=${id}`,
  update_comment: (id) => `comment/${id}/`,
  update_rating: (id) => `rating/${id}/`,
  get_teacher: (id) => `teachers/${id}/`,
  get_review: (id) => `teachers/total_review/?teacher_id=${id}`,
  get_student: (id) => `teachers/total_student/?teacher_id=${id}`,
  get_teacherCourse: (id) => `students/teacher_course/?teacher_id=${id}`,
  add_question: (id) => `chapters/${id}/add_question/`,
  course_unauth: (kw) => `usercourse/${kw}`,
  rec_course: 'recommend/course_recommend/',
  chat_gemeni: 'geminichat/chatgemini/',
  exam:'exams/',
  get_exam:(id) => `courses/${id}/get_exam/`,
  exam_detail:(id) => `exams/${id}/`,
  submit_exam:'student_answers/submit_exam/',
  get_exam_status:(id) => `/student_exams/exam_status/?exam_id=${id}`,
  qualification: 'qualifications/',


};
export default axios.create({
  baseURL: BASE_URL,
});

export const authAPI = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${cookie.load("token")}`,
    },
  });
};
