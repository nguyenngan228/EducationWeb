import './userDashboard.css'
import APIs, { endpoints } from '../../../configs/APIs';
import CourseCard from '../../student/course/courseCard/courseCard';
import { Pagination, Spinner } from 'react-bootstrap';
import SearchBar from '../../student/dashboard/searchBar/searchBar';
import Categories from '../../student/dashboard/cateBar/cateBar';
import { useEffect, useState } from 'react';
export const CourseDashboard=()=>{
    const [categories, setCategories] = useState(null);
    const [courses, setCourses] = useState(null);
    const [cateId, setCateId] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const progress = null

   
    const loadCate = async () => {
        try {
            let res = await APIs.get(endpoints['categories']);
            setCategories(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    const loadCourses = async (categoryId = "", search = "", page = 1) => {
        setLoading(true);
        const url = `?category_id=${encodeURIComponent(categoryId)}&q=${encodeURIComponent(search)}&page=${page}`;
        try {
            let res = await APIs.get(endpoints['course_unauth'](url));
            setCourses(res.data.results);
            setTotalPages(Math.ceil(res.data.count / 10));
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCate();
        loadCourses(cateId, searchTerm, page);
    }, [cateId, searchTerm, page]);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://chatling.ai/js/embed.js";
        script.async = true;
        script.id = "chatling-embed-script";
        document.body.appendChild(script);
        
        script.onload = () => {
            window.chtlConfig = { chatbotId: "8473388233" };
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSelectCate = (cateId) => {
        if (selectedCategory === cateId) {
            setSelectedCategory(""); 
            setCateId(""); 
        } else {
            setSelectedCategory(cateId); 
            setCateId(cateId); 
        }
        setPage(1);
        loadCourses(cateId, searchTerm, 1); 
    };

    const handleSearch = () => {
        setPage(1);
        loadCourses(cateId, searchTerm, 1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <Categories categories={categories} selectedCategory={selectedCategory} handleSelectCate={handleSelectCate} />

            {loading ? (
                <div className="text-center mt-10">
                    <Spinner animation="border" />
                </div>
            ) : courses === null || courses.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground mt-10">
                    No courses found
                </div>
            ) : (
                <>
                    <div className="course-card-wrapper">
                        {courses.map((c) => (
                            <CourseCard
                                key={c.id}
                                id={c.id}
                                title={c.title}
                                url={c.thumbnail}
                                category={c.category.title}
                                chaptersLength={c.chapters.length}
                                progress={progress}
                                price={c.price}
                            />
                        ))}
                    </div>
                    <Pagination size="sm" className="justify-content-center mt-3">
                        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === page}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                    </Pagination>
                </>
            )}
            
        </div>
    );
}