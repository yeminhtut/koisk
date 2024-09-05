import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { Badge } from 'primereact/badge';
import storage from '../utils/storage';

const Header = (props) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const itemRenderer = (item, itemIndex) => {
        return (
            <a className="p-menuitem-link flex align-items-center gap-2" onClick={() => setActiveIndex(itemIndex)}>
                <span className="font-bold">{item.name}</span>
                <Badge value={item.orderCount} severity={activeIndex === itemIndex ? 'info' : 'basic'}></Badge>
            </a>
        )
    }

    const items = [
        {
            name: 'VIEW ALL',
            orderCount: 10,
            template: (item) => itemRenderer(item, 0)
        },
        {
            name: 'NEW',
            orderCount: 2,
            template: (item) => itemRenderer(item, 1)
        },
        {
            name: 'PREPARING',
            orderCount: 4,
            template: (item) => itemRenderer(item, 2)
        },
        {
            name: 'DELAY',
            orderCount: 1,
            template: (item) => itemRenderer(item, 3)
        },
        {
            name: 'PREPARED',
            orderCount: 2,
            template: (item) => itemRenderer(item, 4)
        },
        {
            name: 'COMPLETE',
            orderCount: 0,
            template: (item) => itemRenderer(item, 5)
        },
    ];
    return (
        <nav className="navbar navbar-expand-lg navbar-light flex item-center px-6 pt-2">
            <div className="grid w-full align-items-center" style={{ padding: '0px 10px' }}>
                <div className='col-2'>
                    <i
                        className="pi pi-bars"
                        style={{ fontSize: '2rem' }}
                        onClick={() => props.toggleSideBar()}
                    />
                    {/* <span className="sidebar-header" id="sidebar-header"></span> */}
                    <img
                        title="refresh"
                        className="ml-3"
                        src={`${process.env.PUBLIC_URL}/assets/icons/logo.png`}
                        alt="refresh"
                        style={{ width: '1.2em', height: '1.2em'}}
                    />
                </div>
                
                <TabMenu model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
                <div className="col-1 ml-auto">
                    <span className="flex item-center justify-content-end">
                        <i
                            className="pi pi-sync"
                            style={{ fontSize: '1.5rem' }}
                        ></i>
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default Header;
