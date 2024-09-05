import React from "react";
import ToshibaIcon from '../assets/icons/toshiba-01.svg'

const Footer = () => {
  return (
    <footer className="footer-div ph-16 item-center flex">
      <span className="dashboard_footer_txt">
        2024 © Toshiba Global Commerce Solutions
      </span>
      <img
        src={ToshibaIcon}
        className="dashboard_footer_img ml-auto"
        alt="toshiba global commerce solutions"
      />
    </footer>
  );
};

export default Footer;
