import React, { useEffect } from "react";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";
import styles from "./footer.module.css";
import { Logo } from "../common/logo";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className="flex-1">
          <Logo />
          <p className="mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
            aliquam officiis sint <rem className=""></rem>
          </p>
          <div className="flex gap-4 text-lg mt-6">
            <FaYoutube className="text-red-600 text-3xl cursor-pointer" />
            <FaFacebookF className="text-blue-600 text-3xl cursor-pointer" />
            <FaTiktok className="text-black-100 text-3xl cursor-pointer" />
          </div>
        </div>

        <div className="flex-2">
          <h3 className={styles.heading}>
            Sometime you learn, Sometime you win
          </h3>

          <p>Phone: 0945482444</p>
          <p>Email: thanhngan.220803@gmail.com</p>
          <p>Address: Ho Chi Minh City, Viet Nam</p>
        </div>

        <div className="flex-2">
          <h3 className={styles.heading}>EDUCATION TECHNOLOGY COMPANY</h3>
          <p>Since: 2024</p>
          <p>Education - Technology - Programming</p>
          <p>Founder: Nguyen Ngan</p>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-400 block py-4 text-center">
        <p>© 2024 Elearning Course Website</p>
      </div>
    </footer>
  );
};

export default Footer;
