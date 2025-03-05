import React from "react";
import { Lock, PlayCircle, CheckCircle, ChevronLeft } from "lucide-react";
import "./sideBar.css";
import { Spinner } from "react-bootstrap";
import { CourseProgress } from "../courseProgress/courseProgress";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ course, handleChapterSelect }) => {
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

            const itemClass = `flex items-center gap-x-2 text-sm font-[500] pl-6 transition-all hover:bg-slate-300 ${
              isCompleted ? "completed-text" : "text-black"
            } hover-bg`;
            const borderClass = `${
              isCompleted ? "border-emerald-700" : "border-slate-700"
            } ml-auto opacity-0 h-full transition-all`;

            return (
              <React.Fragment key={c.id}>
                <div className="chapter" onClick={() => handleChapterSelect(c)}>
                  <Icon size={22} className="" />
                  <span>{c.title}</span>
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
    </div>
  );
};
