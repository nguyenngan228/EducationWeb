import { Button, Pagination, Spinner } from "react-bootstrap";
import APIs, { authAPI, endpoints } from "../../../configs/APIs";
import styles from "./dashboard.module.css";
import React, { useContext, useEffect, useState } from "react";
import mycontext from "../../../configs/mycontext";
import { useNavigate } from "react-router-dom";
import CourseCard from "../course/courseCard/courseCard";
import SearchBar from "./searchBar/searchBar";
import Categories from "./cateBar/cateBar";
import debounce from "lodash.debounce";

export const StudentDashBoard = () => {
  const [categories, setCategories] = useState(null);
  const [user, dispatch] = useContext(mycontext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [cateId, setCateId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const loadCate = async () => {
    try {
      let res = await APIs.get(endpoints["categories"]);
      setCategories(res.data);
    } catch (ex) {
      console.error(ex);
    }
  };

  const loadCourses = async (categoryId = "", search = "", page = 1) => {
    setLoading(true);
    console.log(searchTerm)
    const url = `?category_id=${encodeURIComponent(
      categoryId
    )}&q=${encodeURIComponent(searchTerm)}&page=${page}`;
    try {
      let res = await authAPI().get(endpoints["courses"](url));
      setCourses(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCate(); // Load danh mục
    loadCourses(cateId,searchTerm,page); // Load khóa học ban đầu
  }, [page]);

  useEffect(() => {
    const delayedSearch = debounce(() => {
      setPage(1);
      loadCourses(cateId, searchTerm, 1);
    }, 500); // Chờ 500ms sau khi người dùng ngừng nhập mới gọi API

    delayedSearch();

    return () => delayedSearch.cancel(); // Hủy nếu user tiếp tục nhập
  }, [searchTerm, cateId]); // Chỉ gọi khi searchTerm hoặc cateId thay đổi

  


 
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.id = "chatling-embed-script";
    document.body.appendChild(script);

    script.onload = () => {
      window.chtlConfig = { chatbotId: "4289534562" };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  

  const handleSelectCate = (cateId) => {
    if (selectedCategory === cateId) {
      setSelectedCategory("");
      setCateId("");
      loadCourses("", searchTerm, 1);
    } else {
      setSelectedCategory(cateId);
      setCateId(cateId);
      loadCourses(cateId, searchTerm, 1);
    }
    setPage(1);
    loadCourses(cateId, searchTerm, 1);
  };

  const handleSearch = () => {
    setPage(1);
    loadCourses(cateId, searchTerm, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  return (
    <div className="layout">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />
      <div className="mt-4">
        <Categories
          categories={categories}
          selectedCategory={selectedCategory}
          handleSelectCate={handleSelectCate}
        />
      </div>

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
          <div className="grid grid-cols-4 gap-8">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                id={c.id}
                title={c.title}
                url={c.thumbnail}
                category={c.category.title}
                chaptersLength={c.chapters.length}
                progress={c.progress}
                price={c.price}
              />
            ))}
          </div>

          <Pagination className={styles.pagination}>
            <Pagination.Prev
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === page}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            />
          </Pagination>
        </>
      )}
    </div>
  );
};
