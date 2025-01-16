import React from "react";
import ToshibaIcon from '../assets/icons/toshiba-01.svg'

const Footer = () => {
  const todayDate = new Date();
  let copyrightyear = todayDate.getFullYear();
  return (
    <footer className="footer-div ph-16 item-center flex">
      <span className="dashboard_footer_txt">
        {copyrightyear} © Toshiba Global Commerce Solutions
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
