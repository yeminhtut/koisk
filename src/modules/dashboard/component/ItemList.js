import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import appActions from '../../../appActions';
import storage from '../../../utils/storage';

const URL = window?.config?.END_POINT;

const ItemList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('coffee');
    const [isDetail, setIsDetail] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({})
    
    const productList = useSelector((state) => state.product.productList);
    

    useEffect(() => {
        const cart = JSON.parse(storage.get('currCart'));
        if (cart && cart.cartid) {
            setCurrCart(cart)
        }
    }, [])

    useEffect(() => {
        const defaultParams = {
            language: 'en',
            segment: 'T1',
            sort: 'sortorder',
            status: 'Active',
            storeid: 1020,
        };
        dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
    }, [dispatch]);

    useEffect(() => {
        if (currCart?.cartid) {
            getCartBySession();
        }
    }, [currCart]);

    const menuItems = [
        {
            category: 'coffee',
            items: productList.filter(
                (prod) => prod.categorycodes === 'COFFEE',
            ),
        },
        { category: 'drinks', items: [] }, // Add drink items here
        { category: 'snacks', items: [] }, // Add snack items here
    ];

    const getCartBySession = () => {
        const { cartid, orderid } = currCart;

        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/${orderid}?&status=sales`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
        };

        axios
            .request(config)
            .then((response) => setCartDetail(response.data))
            .catch((error) => console.log(error));
    };

    const getImage = (item) => {
        return item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    const handleSelectedItem = (item) => {
        setIsDetail(true);
        setSelectedItem(item);
    };

    const handleAddItem = () => {
        setIsDetail(false);
        setSelectedItem({});
    };

    const handleViewCart = () => {
        navigate('/confirm-order', { replace: true });
    };

    const productListing = () => (
        <div className="col-lg-6 col-md-12 menu-container">
            <nav className="menu-tabs">
                <ul>
                    {menuItems.map((menu, index) => (
                        <li
                            key={index}
                            className={activeTab === menu.category ? 'active' : ''}
                            onClick={() => setActiveTab(menu.category)}
                        >
                            {menu.category}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="menu-content">
                {menuItems.find((menu) => menu.category === activeTab)?.items.map((item, index) => (
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
                            <span className="menu-item-price">
                                {item.baseprice}.000
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {currCart && (
                <div
                className="add-to-order flex align-items-center justify-content-between px-2"
                onClick={handleViewCart}
            >
                <span>{cartDetail.itemcount} item</span>
                <span>View Cart</span>
                <span>₱ {cartDetail.totalamount}</span>
            </div>
            )}
            
        </div>
    );

    return (
        <div className="grid fullHeight">
            <div className="col-6 d-none d-md-block col-6 leftSpace"></div>
            {isDetail ? (
                <ProductDetail
                    selectedItem={selectedItem}
                    handleAddItem={handleAddItem}
                />
            ) : (
                productListing()
            )}
        </div>
    );
};

const ProductDetail = ({ selectedItem, handleAddItem }) => {
    const [quantity, setQuantity] = useState(1);
    const currCart = JSON.parse(storage.get('currCart'));

    const getImage = () => {
        return selectedItem.images
            ? `${URL}/${selectedItem.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    const handleAdd = () => {
        currCart?.cartid ? addItem() : createCart();
    };

    const addItem = () => {
        const { productpricecode } = selectedItem;
        const { orderid, cartid } = currCart;

        const data = JSON.stringify({
            orderid,
            productpricecode,
            quantity,
            additionalfields: {
                images: '/media/phstoreimages-2/espresso.png',
            },
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/item`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
            data,
        };

        axios
            .request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                handleAddItem();
            })
            .catch((error) => console.log(error));
    };

    const createCart = () => {
        const data = JSON.stringify({
            storeid: '1020',
            language: 'en',
            qno: 'Y',
            signonid: '0ba4b9fabdf34eb32e68188413fc66b38067b28edb6fada74423e7c6e5c845f1',
            terminalid: '2',
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/new`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
            data,
        };

        axios
            .request(config)
            .then((response) => {
                storage.set('currCart', JSON.stringify(response.data));
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => console.log(error));
    };

    return (
        <div className="product-detail-container col-lg-6 col-md-12">
            <div className="flex flex-column h-full">
                <div
                    className=""
                    style={{
                        backgroundImage: `url(${getImage()})`,
                        height: '300px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
                <div className="item-info p-4">
                    <h2>{selectedItem.additionalfields.title}</h2>
                    <p>{selectedItem.articlefields.description}</p>
                </div>
                <div className="flex flex-column mt-auto">
                    <div className="quantity-selector">
                        <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    <button className="add-to-order" onClick={handleAdd}>
                        add to order ₱ {(selectedItem.baseprice * quantity).toFixed(3)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemList;
