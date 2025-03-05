import React, { useContext, useReducer } from "react";
import { LogOut } from "lucide-react";
import styles from "./topBar.module.css";
import mycontext from "../../../../configs/mycontext";
import { useNavigate } from "react-router-dom";

export const TopBar = ({ navToFeed }) => {
  const [user, dispatch] = useContext(mycontext);
  const navigate = useNavigate();
  const handleAvatarClick = () => {
    navigate("/stuwall/profile");
  };
  return (
    <div className="top-bar flex justify-between">
      <div></div>
      <div className="right-options gap-8">
        <LogOut className="lock-icon cursor-pointer" />
        <div className="relative">
          <button
            onClick={handleAvatarClick}
            className="hover:opacity-75 transition flex justify-center items-center"
          >
            <img src={user.avatar} className={styles.avatar} />
            <div className={styles.accountName}>
              <span className={styles.fullname}>
                {user.first_name} {user.last_name}
              </span>
              <span className={styles.username}>@{user.username}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
