import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import SidebarArrow from '../assets/icons/sidebar_arrow.png'

const routesForSideBar = [
    {
        label: "Kitchen Display",
        icon: '',
        keywords: "consumer management,producer management",
        marginDimension: "0.5em",
        childMenu: "brokerSubMenu",
        highlightClass: "",
        module: "BROKER",
        configaccess: "showBroker",
        child: [
            {
                label: "Kitchen Display",
                path: "/ui/product",
                group: "DE_BROKER_CLIENT",
                module: "BROKER",
            },
        ],
    }
];

const Sidebar = (props) => {
    const [activeIndex, setActiveIndex] = useState("");
    const refContainer = useRef({});

    const _setRef = (element) => {
        if (element) refContainer.current[element.id] = element;
    };

    const _collapseRef = (id, parent, index) => {
        const _refContainer = refContainer.current;

        if (!parent) {
            return;
        } else {
            for (const key of Object.keys(_refContainer)) {
                if (_refContainer[key].classList.contains("show")) {
                    if (
                        key !== id &&
                        !index.startsWith(activeIndex + "_") &&
                        activeIndex !== index
                    ) {
                        _refContainer[key].classList.toggle("show");
                        _refContainer[
                            key
                        ].previousSibling.lastElementChild.classList.remove(
                            "rotate_down"
                        );
                        _refContainer[
                            key
                        ].previousSibling.lastElementChild.classList.add(
                            "rotate"
                        );
                    }
                }
            }

            if (id) {
                _refContainer[id].classList.toggle("show");

                if (_refContainer[id].classList.contains("show")) {
                    _refContainer[
                        id
                    ].previousSibling.lastElementChild.classList.add(
                        "rotate_down"
                    );
                } else {
                    _refContainer[
                        id
                    ].previousSibling.lastElementChild.classList.remove(
                        "rotate_down"
                    );
                    _refContainer[
                        id
                    ].previousSibling.lastElementChild.classList.add("rotate");
                }
            }
        }
    };

    const _matchIndex = (index) => {
        const splitTexts = index.split("_");
        return (
            splitTexts.findIndex(
                (splitText) =>
                    activeIndex === splitText ||
                    activeIndex.startsWith(splitText + "_")
            ) > -1
        );
    };

    const _drawMenuWithNoChild = (
        index,
        module,
        highlightClass,
        icon,
        isSideBarActive,
        path,
        label,
        marginDimension,
        menuIcon
    ) => {
        return (
            <li
                key={index}
                style={{ display: "block" }}
                onClick={() => {
                    if (isSideBarActive) {
                        props.toggleSideBar();
                    } else {
                        _collapseRef("", true, index);
                        setActiveIndex(index);
                    }
                }}
                className={
                    isSideBarActive
                        ? _matchIndex(index)
                            ? `nav-selected`
                            : `${highlightClass}`
                        : ""
                }
            >
                <Link
                    to={path}
                    className={
                        isSideBarActive ? "" : _matchIndex(index) ? `nav-selected`: `${highlightClass}`
                    }
                >
                    {menuIcon && <i className={menuIcon} style={{'fontSize': '2em', marginLeft: '8px'}}></i> }
                    <span
                        style={{ marginLeft: marginDimension, paddingLeft: 0 }}
                    >
                        {label}
                    </span>
                </Link>
                <span className="hover_span">{label}</span>
            </li>
        );
    };
    const _drawChild = (child, childMenu, index) => {
        const { label, path } =
            child;
        return (
            <li
                key={index}
                style={{ display: "block" }}
                onClick={(event) => {
                    _collapseRef(childMenu, false, index);
                    event.stopPropagation();
                }}
            >
                <Link to={path}>{label}</Link>
            </li>
        );
    };

    const _drawMenuWithChild = (
        child,
        childMenu,
        index,
        module,
        highlightClass,
        icon,
        isSideBarActive,
        path,
        label,
        marginDimension,
        menuIcon
    ) => {
        return (
            <li
                key={index}
                style={{ display: "block" }}
                onClick={(event) => {
                    if (isSideBarActive) {
                        props.toggleSideBar();
                    } else {
                        _collapseRef(childMenu, true, index);
                        setActiveIndex(index);
                        event.stopPropagation();
                    }
                }}
                className={
                    isSideBarActive
                        ? _matchIndex(index)
                            ? `nav-selected`
                            : `${highlightClass}`
                        : ""
                }
            >
                <a
                    href="/"
                    onClick={(event) => event.preventDefault()}
                    data-toggle="collapse"
                    aria-expanded="false"
                    className={
                        isSideBarActive
                            ? ""
                            : _matchIndex(index)
                            ? `nav-selected`
                            : `${highlightClass}`
                    }
                    style={{ display: 'flex', alignItems: 'center'}}
                >
                    {icon && <img alt="" src={icon} />}
                    {menuIcon && <i className={menuIcon} style={{'fontSize': '2em'}}></i> }
                    <span
                        style={{ marginLeft: marginDimension, paddingLeft: 0 }}
                    >
                        {label}
                    </span>
                    <img
                        alt=""
                        id="dropdown"
                        className="sidebar_dropdown rotate"
                        style={{ height: "0.8em", width: "0.8em" }}
                        src={SidebarArrow}
                    />
                </a>
                <ul
                    className="collapse list-unstyled"
                    style={{ paddingLeft: `${index.split("_").length - 1}em` }}
                    id={childMenu}
                    data-parent="#sidebar"
                    ref={_setRef}
                >
                    {child.map((subChild, subIndex) => {
                        if (typeof subChild.child !== "undefined") {
                            return _drawMenu(
                                subChild,
                                `${index}_${subChild.childMenu}`
                            );
                        } else {
                            return _drawChild(
                                subChild,
                                childMenu,
                                `${index}_${subIndex.toString()}`
                            );
                        }
                    })}
                </ul>
                <span className="hover_span">{label}</span>
            </li>
        );
    };

    const _drawMenu = (route, index) => {
        const {
            path,
            icon,
            label,
            child,
            childMenu,
            marginDimension,
            highlightClass,
            module,
            menuIcon
        } = route;

        const { isSideBarActive } = props;

        if (label === "ADMIN") {
            return (
                <li key={index} className="admindiv">
                    {label}
                </li>
            );
        } else if (typeof child === "undefined") {
            return _drawMenuWithNoChild(
                index,
                module,
                highlightClass,
                icon,
                isSideBarActive,
                path,
                label,
                marginDimension,
                menuIcon
            );
        } else {
            return _drawMenuWithChild(
                child,
                childMenu,
                index,
                module,
                highlightClass,
                icon,
                isSideBarActive,
                path,
                label,
                marginDimension,
                menuIcon
            );
        }
    };

    const { isSideBarActive } = props;

    return (
        <nav id="sidebar" className={isSideBarActive ? "active shadow-1" : "shadow-1"}>
            <div style={{ padding: "1.2em 0" }}>
                <span className="sidebaractive-header"></span>
            </div>
            <ul className="list-unstyled components">
                {routesForSideBar.map((route, index) =>
                    _drawMenu(route, index.toString())
                )}
            </ul>
        </nav>
    );
};

export default Sidebar;
