import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import appActions from '../../../appActions';
import storage from '../../../utils/storage';
import ImageIcon from '../../../components/ImageIcon';
import AdsArea from './AdsArea';

const URL = window?.config?.END_POINT;
const storeid = window?.config?.storeid;
const terminalid = window?.config?.terminalid;

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('coffee');
    const [isDetail, setIsDetail] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({});
    const [order, setOrder] = useState();

    const productList = useSelector((state) => state.product.productList);

    // Fetch current cart from local storage on component mount
    useEffect(() => {
        const storedCart = storage.get('currCart');
        if (storedCart) {
            const cart = JSON.parse(storedCart);
            if (cart?.cartid) setCurrCart(cart);
        }
    }, []);

    // Fetch all products when the component mounts
    useEffect(() => {
        const defaultParams = {
            language: 'en',
            segment: 'T1',
            sort: 'sortorder',
            status: 'Active',
            storeid: storeid,
        };
        dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
    }, [dispatch]);

    // Fetch cart details when current cart changes
    useEffect(() => {
        if (currCart?.cartid) {
            const { cartid, orderid } = currCart;
            let sessionid = storage.get('sessionid') || currCart.sessionid;
            getCartBySession(cartid, orderid, sessionid);
        }
    }, [currCart]);

    const menuItems = [
        {
            category: 'coffee',
            items: productList.filter(
                (prod) => prod.categorycodes === 'COFFEE',
            ),
        },
        {
            category: 'drinks',
            items: productList.filter(
                (prod) => prod.categorycodes === 'DRINKS',
            ),
        },
        {
            category: 'snacks',
            items: productList.filter(
                (prod) =>
                    prod.categorycodes === 'SNACKS' ||
                    prod.categorycodes === 'COFFEE',
            ),
        },
    ];

    const getCartBySession = (cartid, orderid, sessionid) => {
        const config = {
            method: 'get',
            url: `${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${sessionid}&status=sales`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
        };

        axios
            .request(config)
            .then((response) => setCartDetail(response.data))
            .catch((error) => console.error(error));
    };

    const getImage = (item) =>
        item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    const handleSelectedItem = (item) => {
        setIsDetail(true);
        setSelectedItem(item);
    };

    const handleAddItem = (order, cartid) => {
        const { sessionid, orderid } = order;
        storage.set('sessionid', sessionid);
        setSelectedItem({});
        setOrder(order);
        getCartBySession(cartid, orderid, sessionid);
        setIsDetail(false);
    };

    const handleViewCart = () => navigate('/confirm-order', { replace: true });

    const checkCartValue = () => !!(order?.orderid || currCart?.cartid);

    const handleClose = () => setIsDetail(false)

    const productListing = () => {
        return (
            <>
            <div className="menu-tabs">
                    <ul>
                        {menuItems.map((menu, index) => (
                            <li
                                key={index}
                                className={
                                    activeTab === menu.category ? 'active' : ''
                                }
                                onClick={() => setActiveTab(menu.category)}
                            >
                                {menu.category}
                            </li>
                        ))}
                    </ul>
                </div>
                {menuItems
            .find((menu) => menu.category === activeTab)
            ?.items.map((item, index) => (
                <div
                    className="menu-item p-2 cursor-pointer"
                    key={index}
                    onClick={() => handleSelectedItem(item)}
                >
                    <img
                        src={getImage(item)}
                        alt={item.name}
                        className="menu-item-image"
                    />
                    <div className="menu-item-details">
                        <h3>{item.additionalfields.title}</h3>
                        <p className="mb-4">{item.articlefields.description}</p>
                        <span className="menu-item-price">
                            {item.baseprice}.000
                        </span>
                    </div>
                </div>
            ))}
            {(checkCartValue() || cartDetail?.cartid) && (
                    <div
                        className="fixed col-md-12 col-lg-6 cart-summary sticky-cart-summary add-to-order flex align-items-center justify-content-between p-4"
                        onClick={handleViewCart}
                        
                    >
                        <span style={{ fontSize: '22px'}}>{cartDetail.itemcount} item</span>
                        <span style={{ fontSize: '28px'}}>View Cart</span>
                        <span style={{ fontSize: '22px'}}>₱ {cartDetail.totalamount}.000</span>
                    </div>
                )}
            </>
        )
    };

    return (
        <div className="flex" style={{ height: '100vh' }}>
            <AdsArea />
            <div className="menu-area">
                
                <div className="menu-items">
                    {isDetail ? (
                        <ProductDetail
                            selectedItem={selectedItem}
                            handleAddItem={handleAddItem}
                            currCart={currCart}
                            handleClose={handleClose}
                        />
                    ) : (
                        productListing()
                    )}
                </div>
                {/* {(checkCartValue() || cartDetail?.cartid) && (
                    <div className="cart-summary sticky-cart-summary">
                        <span>{cartItems} item</span>
                        <span>View Cart</span>
                        <span>₱ {totalAmount}</span>
                    </div>
                )} */}
                
            </div>
        </div>
    );
};

const ProductDetail = ({
    selectedItem,
    handleAddItem,
    currCart,
    handleClose,
}) => {
    const [quantity, setQuantity] = useState(1);

    const handleCloseDetail = () => handleClose();

    const getImage = () =>
        selectedItem.images
            ? `${URL}/${selectedItem.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    const handleAdd = () =>
        currCart?.cartid ? addItem(currCart) : createCart();

    const addItem = (cart) => {
        const { productpricecode } = selectedItem;
        const { orderid, cartid } = cart;

        const data = JSON.stringify({
            orderid,
            productpricecode,
            quantity,
            additionalfields: { images: '/media/phstoreimages-2/espresso.png' },
        });

        axios
            .post(`${URL}/pos/v1/cart/${cartid}/item`, data, {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => handleAddItem(response.data, cartid))
            .catch((error) => console.error(error));
    };

    const createCart = () => {
        const data = JSON.stringify({
            storeid: storeid,
            language: 'en',
            qno: 'Y',
            signonid: storage.get('signonid'),
            terminalid: terminalid,
        });

        axios
            .post(`${URL}/pos/v1/cart/new`, data, {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                storage.set('currCart', JSON.stringify(response.data));
                const { sessionid } = response.data;
                storage.set('sessionid', sessionid);
                addItem(response.data);
            })
            .catch((error) => console.error(error));
    };

    return (
        <div className="flex flex-column h-full">
            <MenuItem
                label={selectedItem.additionalfields.title}
                imgSrc={getImage()}
                handleCloseDetail={handleCloseDetail}
            />
            {/* <div
                style={{
                    backgroundImage: `url(${getImage()})`,
                    height: '300px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <ImageIcon iconName={'close.png'} style={{ width: '30px', height: '30px' }} />
            </div> */}
            <div className="item-info p-4">
                <h2>{selectedItem.additionalfields.title}</h2>
                <p>{selectedItem.articlefields.description}</p>
            </div>
            <div className="flex flex-column mt-auto">
                <div className="quantity-selector">
                    <button
                        onClick={() =>
                            setQuantity(quantity > 1 ? quantity - 1 : 1)
                        }
                    >
                        -
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className="add-item w-full" onClick={handleAdd}>
                    Add to order ₱{' '}
                    {(selectedItem.baseprice * quantity).toFixed(3)}
                </button>
            </div>
        </div>
    );
};

const MenuItem = ({ label, imgSrc, handleCloseDetail }) => {
    return (
        <div className="menu-item">
            <div className="menu-item-left">
                <div onClick={handleCloseDetail}>
                    <ImageIcon
                        iconName={'close.png'}
                        style={{ width: '20px', height: '20px' }}
                    />
                </div>
                <label htmlFor={label} className="menu-item-label">
                    {label}
                </label>
            </div>
            <img
                src={imgSrc}
                alt={label}
                style={{ width: '80px', height: '80px' }}
            />
        </div>
    );
};



export default ProductList;
