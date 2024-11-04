import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header';
import AdsArea from './modules/dashboard/component/AdsArea';

const Layout = props => {
    const { children } = props
    return (
        <div className='wrapper'>
            <div id="content">
                <div className='app-container'>
                    <AdsArea />
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout
