import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header';
import "./assets/css/layout/layout.scss";

const Layout = props => {
    const { children } = props
    const [isSideBarActive, setIsSideBarActive] = useState(false)
    const _toggleSideBar = () => {
        setIsSideBarActive(!isSideBarActive)
      };
    const _logoutClick = () => {}
    return (
        <div className='wrapper'>
            <Sidebar
                isSideBarActive={isSideBarActive}
                toggleSideBar={_toggleSideBar}
            />
            <div id="content">
                <Header
                    toggleSideBar={_toggleSideBar}
                    logoutClick={_logoutClick}
                />
                {children}
            </div>
        </div>
    )
}

export default Layout
