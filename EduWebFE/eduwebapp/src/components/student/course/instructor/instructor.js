import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI, endpoints } from "../../../../configs/APIs";
import { TopBar } from "../topBar/topBar";
import './instructor.css'
import CourseCard from "../courseCard/courseCard";

export const Instructor = () => {
    const location = useLocation();
    const teacherId = location.state?.id;
    const [teacher, setTeacher] = useState(null)
    const [review, setReview] = useState(null)
    const [student, setStudent] = useState(null)
    const [course, setCourse] = useState(null)
    const progerss = null
    const nav = useNavigate()
    const loadUser = async () => {
        try {
            let res = await authAPI().get(endpoints['get_teacher'](teacherId))
            setTeacher(res.data)
        } catch (ex) {
            console.error(ex)
        }
    }
    const navToFeed = () => {
        nav('/stuwall');
    };

    const loadReview = async () => {
        try {
            let res = await authAPI().get(endpoints['get_review'](teacherId))
            setReview(res.data)
        } catch (ex) { console.error(ex) }
    }
    useEffect(() => {
        loadUser()
    }, teacherId)
    useEffect(() => {
        loadReview()
    }, teacherId)

    const get_student = async () => {
        try {
            let res = await authAPI().get(endpoints['get_student'](teacherId))
            setStudent(res.data)
        } catch (ex) { console.error(ex) }
    }

    useEffect(() => {
        get_student()
    }, teacherId)

    const get_course = async () => {
        try {
            let res = await authAPI().get(endpoints['get_teacherCourse'](teacherId))
            setCourse(res.data)
        } catch (ex) { console.error(ex) }
    }

    useEffect(() => {
        get_course()
    }, teacherId)





    return (
        <div className="container">
            <div className="content">
                <TopBar navToFeed={navToFeed} />
                <div className="instructor-profile">
                    <div className="instructor-details">
                        <h4 className="instructor-role">INSTRUCTOR</h4>
                        {teacher === null ? <>Loading</> : (
                            <div className="instructor-grid">
                                <div className="instructor-details">
                                    <h1 className="instructor-name">
                                        {teacher.user.first_name} {teacher.user.last_name}
                                    </h1>
                                    <h3 className="instructor-position">{teacher.user.qualification}</h3>
                                    <div className="statistics">
                                        {student === null ? <>Loading</> : (<>
                                            <div className="stat">
                                                <h5>Total students</h5>
                                                <p>{student}</p>
                                            </div>
                                        </>)}
                                        {review === null ? <>Loading...</> : (<>
                                            <div className="stat">
                                                <h5>Reviews</h5>
                                                <p>{review}</p>
                                            </div>

                                        </>)}
                                    </div>

                                    <div className="about-me">
                                        <h4>My course</h4>
                                        {course === null ? <>Loading</> : (<>
                                                <div className="course-list"> 
                                                {course.map(c => (
                                                    <CourseCard
                                                        key={c.id}
                                                        id={c.id}
                                                        title={c.title}
                                                        url={c.thumbnail}
                                                        progress = {progerss}
                                                        review = {c.review}
                                                        chaptersLength = {c.chapter}
                                                        price={c.price}
                                                        category={c.category.name}
                                                    />
                                                ))}
                                            </div>
                                            </>

                                        )}
                                    </div>
                                </div>

                                <div className="instructor-avatar">
                                    <img src={teacher.user.avatar} alt="Instructor Avatar" className="avatar-img" />
                                    <button className="message-button">Send message</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};