import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import TaskHeader from './components/TaskHeader';
import "./assets/css/layout/layout.scss";

const TaskLayout = props => {
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
                <TaskHeader
                    toggleSideBar={_toggleSideBar}
                    logoutClick={_logoutClick}
                />
                {children}
            </div>
        </div>
    )
}

export default TaskLayout
