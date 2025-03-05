import { useContext, useEffect, useState } from "react"
import { authAPI, endpoints } from "../../../configs/APIs"
import mycontext from "../../../configs/mycontext"
import CourseCard from "../course/courseCard/courseCard"
import './MyLearning.css'
import { CheckCircle, Clock } from "lucide-react"
import Footer from "../../footer/footer"

export const MyLearning = () => {
    const [courses, setCourses] = useState([]);
    const [user] = useContext(mycontext);
    const userId = user.id;

    const loadMyCourses = async () => {
        try {
            let res = await authAPI().get(endpoints['get_courses_of_student']);
            setCourses(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        loadMyCourses();
    }, [userId]);

    const completed = courses.filter(course => {
        if (course.progress === 100.0) {
            return true;
        }
    }).length;

    const inProgress = courses.filter(course => {
        if (course.progress !== 100.0) {
            return true;
        }
    }).length;

    return (
        <div>
            <div className="course-status-container">
                <div className="course-status">
                    <div>
                        <Clock size={30} style={{ margin: '8px', color: '#00A5E5' }} />
                    </div>
                    <div className="status-info">
                        <h3>In Progress</h3>
                        <p>{inProgress} {inProgress === 1 ? 'Course' : 'Courses'}</p>
                    </div>
                </div>
                <div className="course-status">
                    <div>
                        <CheckCircle size={30} style={{ margin: '8px', color: '#388E3C' }} />
                    </div>
                    <div className="status-info">
                        <h3>Completed</h3>
                        <p>{completed} {completed === 1 ? 'Course' : 'Courses'}</p>
                    </div>
                </div>
            </div>
            {courses.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground mt-10">
                    No courses found
                </div>
            ) : (
                <div className="course-card-wrapper grid grid-cols-4 gap-8 ml-8">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            url={course.thumbnail}
                            category={course.category.title}
                            chaptersLength={course.chapters.length}
                            progress={course.progress}
                            price={course.price}
                        />
                    ))}
                </div>
            )}

        </div>

    );
};