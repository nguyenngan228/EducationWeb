import React from "react";
import styles from "./cateBar.module.css";
import { Spinner } from "react-bootstrap";

const Categories = ({ categories, selectedCategory, handleSelectCate }) => {
  if (categories === null) {
    return <Spinner animation="border" />;
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleSelectCate(category.id)}
            className={`${styles.item} ${
              selectedCategory === category.id ? styles.selected : ""
            }`}
          >
            <span className={styles.title}>{category.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Categories;
