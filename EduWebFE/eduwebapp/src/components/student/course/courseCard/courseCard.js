import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "react-feather";
import styles from "./courseCard.module.css";
import { Button, ProgressBar } from "react-bootstrap";
import { PlusCircle, ShoppingCart, Star } from "lucide-react";
import mycontext from "../../../../configs/mycontext";
import { useCart } from "../../../../configs/mycartcontext";

const CourseCard = ({
  id,
  title,
  url,
  chaptersLength,
  progress,
  price,
  category,
  review,
}) => {
  const navigate = useNavigate();
  const [user] = useContext(mycontext);
  const { dispatch } = useCart();
  const handleCardClick = () => {
    navigate(`/stuwall/course/${id}`);
  };
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (user) {
      dispatch({
        type: "ADD_TO_CART",
        payload: { id, title, url, price, quantity: 1 },
      });
    } else {
      navigate("/login");
    }
  };
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return [...Array(5)].map((_, index) => {
      if (index < fullStars) {
        return (
          <span key={index} className="star filled">
            <Star size={16} />
          </span>
        );
      } else if (index === fullStars && hasHalfStar) {
        return (
          <span key={index} className="star half-filled">
            <Star size={16} />
          </span>
        );
      } else {
        return (
          <span key={index} className="star">
            <Star size={16} />
          </span>
        );
      }
    });
  };
  return (
    <div onClick={handleCardClick} className={styles.container}>
      <div className={styles.wrapperImage}>
        <img className={styles.image} alt={title} src={url} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.category}>{category}</p>
        <div className={styles.info}>
          <div className={styles.chapter}>
            <BookOpen size={16} style={{ marginRight: "8px" }} />
            <span className={styles.titleChapter}>
              {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
            </span>
          </div>
          <div className={styles.rating}>{renderStars(review)}</div>
        </div>
        {progress !== null ? (
          <div className="mt-3">
            <ProgressBar
              variant="success"
              now={progress}
              style={{ height: "10px" }}
            />
            <p
              style={{
                fontWeight: "bold",
                color: "#28a745",
                fontSize: "1.2rem",
              }}
              className="progress-text mt-2 text-sm"
            >{`${Math.floor(progress)}% Complete`}</p>
          </div>
        ) : (
          <div>
            <div className={styles.button}>
              <p className={styles.price}>$ {price.toFixed(2)}</p>
              <div className={styles.buttonCart}>
                <Button
                  onClick={handleAddToCart}
                  type="button"
                  className={styles.addCart}
                >
                  {/* <PlusCircle size={20} /> */}
                  <ShoppingCart className={styles.iconCart} size={20} />
                </Button>
                <Button type="button" className={styles.buy}>
                  {/* <ShoppingCart size={20} /> */}
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;