import React, { useState } from 'react'
import AdsArea from './modules/dashboard/component/AdsArea';
import FloatingHomeButton from './components/FloatingHomeButton';

const Layout = props => {
    const { children } = props
    return (
        <div className='wrapper'>
            <div id="content">
                <div className='app-container' style={{ width: '100%', maxWidth: '100%', margin: '0px', padding: '0px'}}>
                    <AdsArea />
                    <FloatingHomeButton />
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout
