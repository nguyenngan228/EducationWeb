import { LogOut, Menu, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { useContext, useState } from "react";
import mycontext from "../../configs/mycontext";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useCart } from "../../configs/mycartcontext";
import styles from "./navbar.module.css";
import { Logo } from "./logo";
import NavbarRoutes from "./navbarroutes";
import cookie from "react-cookies";
import axios from "axios";

export const Navbar = ({ onSidebarToggle }) => {
  const [user, dispatch] = useContext(mycontext);
  const navigate = useNavigate();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [itemsCart, setItemsCart] = useState([]);
  const { state, setState } = useCart();
  const handleAvatarClick = () => {
    setShowSubMenu(!showSubMenu);
    if (user.is_teacher) navigate("/teawall/profile");
    else if (user.is_student) navigate("/stuwall/profile");
  };

  const logout = () => {
    cookie.remove("token", { path: "/" });
    cookie.remove("user", { path: "/" });
    axios.defaults.headers.common["Authorization"] = null;
    dispatch({ type: "logout" }); 
    navigate("/login", { replace: true });
  };

  const addToCart = (course) => {
    setItemsCart([...itemsCart, course]);
  };
  const handleLinkToCart = () => {
    navigate("/stuwall/cart");
  };
  const handleLinkToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      {/* Button toogle */}
      {/* <button
        onClick={onSidebarToggle}
        className="pr-4 hover:opacity-75 transition"
      >
        <Menu />
      </button> */}

      <div className={styles.logo}>
        <Logo />
      </div>
      <div>
        <NavbarRoutes />
      </div>


      <div className={styles.wrapper}>
        {user.is_teacher === false ? <><div className="relative">
          <Button
            onClick={handleLinkToCart}
            type="button"
            className="text-dark bg-transparent border-0"
          >
            <ShoppingCart size={20} />
            <span className={styles.badge}>{state.items.length}</span>
          </Button>
        </div></> : <></>}


        {user === null ? (
          <>
            <button onClick={handleLinkToLogin}>Login/Register</button>
          </>
        ) : (
          <>
            <div>
              <Button
                type="button"
                onClick={logout}
                className="text-dark bg-transparent border-0"
              >
                <LogOut size={20} />
              </Button>
            </div>

            <button onClick={handleAvatarClick} className={styles.account}>
              <img src={user.avatar} className={styles.avatar} />

              <div className={styles.accountName}>
                <span className={styles.fullname}>
                  {user.first_name} {user.last_name}
                </span>
                <span className={styles.username}>@{user.username}</span>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
