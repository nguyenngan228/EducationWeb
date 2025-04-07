import React from "react";
import { Lock, PlayCircle, CheckCircle, ChevronLeft, FileText } from "lucide-react";
import "./sideBar.css";
import { Spinner } from "react-bootstrap";
import { CourseProgress } from "../courseProgress/courseProgress";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ course, handleChapterSelect, handleExamSelect }) => {
  const navigate = useNavigate();
  const handleExit = () => {
    navigate("/stuwall/dashboard");
  };
  return (
    <div className="sidebar">
      {course === null ? (
        <Spinner animation="border" />
      ) : (
        <>
          <div className="sidebar-head">
            <div className="flex cursor-pointer mb-4 back">
              <ChevronLeft onClick={handleExit} />
              <span className="text-stone-950">Back</span>
            </div>

            <h4 className="sidebar-title">{course.title}</h4>
          </div>

          {course.is_purchased && <CourseProgress value={course.progress} />}

          {/* Render chapters */}
          {course.chapters.map((c) => {
            const isLocked = !c.is_free && !course.is_purchased;
            const isCompleted = course.userProgress.some(
              (progress) => progress.chapter === c.id && progress.is_completed
            );
            const Icon = isLocked
              ? Lock
              : isCompleted
                ? CheckCircle
                : PlayCircle;

            return (
              <React.Fragment key={`chapter-${c.id}`}>
                <div className="chapter" onClick={() => handleChapterSelect(c)}>
                  <Icon size={22} />
                  <span>{c.title}</span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Render Exam cuối cùng nếu có */}
          {course.exam && (
            <div
              className="chapter mt-4 exam-item"
              onClick={() => handleExamSelect(course.exam)}
            >
              <FileText size={22} />
              <span>{course.exam.title}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
