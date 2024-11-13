import React, { useState } from 'react'
import AdsArea from './modules/dashboard/component/AdsArea';

const Layout = props => {
    const { children } = props
    return (
        <div className='wrapper'>
            <div id="content">
                <div className='app-container' style={{ width: '100%', maxWidth: '100%', margin: '0px', padding: '0px'}}>
                    <AdsArea />
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout
