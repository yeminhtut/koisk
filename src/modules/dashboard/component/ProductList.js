import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import appActions from '../../../appActions';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import storage from '../../../utils/storage';

const ProductList = () => {
    const dispatch = useDispatch();
    const [selectedCategory, setSelectedCategory] = useState('TOP10TRENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [signOnData, setSignOnData] = useState({});

    const storeCategory = useSelector((state) => state.product.category);
    const productList = useSelector((state) => state.product.productList);

    useEffect(() => {
        getSignOn();
        //createSignOn();
    }, []);

    const getSignOn = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/pos/v1/terminal/signon/search/fields?terminalid=2&storeid=1013&status=Active',
            headers: {
                Authorization: 'test',
            },
        };

        axios
            .request(config)
            .then((response) => {
                setSignOnData(response.data);
                //console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const createSignOn = () => {
        let data = JSON.stringify({
            storeid: '1020',
            posid: '1020002',
            terminalid: '2',
            usercode: '112',
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/pos/v1/terminal/signon',
            headers: {
                Authorization:
                    'kzxqzgyt16a51d294a83a6596d22345b8817e3eebcd4fe4dbd30d514b1cc050cc33aa611c4e36cd8ded5f2eb0f4741e4023cf3fd3q46bd9o',
                'Content-Type': 'application/json',
            },
            data: data,
        };

        axios
            .request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // useEffect(() => {
    //     dispatch(appActions.CATEGORY_GET_ALL_REQUEST());
    // }, []);

    useEffect(() => {
        if (storeCategory.id) {
            const { subcategories } = storeCategory;
            setCategoryList(subcategories);
            setSelectedCategory(subcategories[0]);
        }
    }, [storeCategory]);

    useEffect(() => {
        const defaultParams = {
            categorycode: selectedCategory.categorycode,
            categorycode: 'TOP10TRENDING',
            language: 'en',
            segment: 'T1',
            sort: 'sortorder',
            status: 'Active',
            storeid: 1013,
        };
        dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
    }, [selectedCategory]);

    const handleItem = (item) => {
        setSelectedItem(item);
    };

    const handleDeselectItem = () => setSelectedItem('');

    return (
        <div className="app">
            <header
                className="header"
                style={{ backgroundImage: 'linear-gradient(#D4B297, #B9ADAA)' }}
            >
                <div className="logo">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/images/ic_launchicon.png`}
                        alt="T-Cafe"
                    />
                </div>
                <div className="location">
                    harlan + holden coffee Taguig,Philippines
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="I'm looking for..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* <div className="language-selectors">
                    <img src="/path/to/th-flag.png" alt="TH" />
                    <img src="/path/to/en-flag.png" alt="EN" />
                    <img src="/path/to/cn-flag.png" alt="CN" />
                </div> */}
                <div className="cart-icon">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/images/ic_cart.svg`}
                        alt="Cart"
                    />
                </div>
            </header>
            <nav className="categories">
                {categoryList.map((category) => (
                    <button
                        key={category.id}
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category.title}
                    </button>
                ))}
            </nav>
            <main className="content">
                <h2>{selectedCategory.title}</h2>
                <div className="pizza-list">
                    {productList.map((item, index) => (
                        <ProductItem
                            key={index}
                            item={item}
                            handleItem={handleItem}
                        />
                    ))}
                </div>
            </main>
            {selectedItem && selectedItem.productcode && (
                <ProductDialog
                    item={selectedItem}
                    handleDeselectItem={handleDeselectItem}
                    signOnData={signOnData}
                />
            )}
        </div>
    );
};

const ProductItem = (props) => {
    const dispatch = useDispatch();
    const { item } = props;
    const { images, baseprice, additionalfields } = item;

    const { title } = additionalfields;

    const URL = window && window.config && window.config.END_POINT;

    const handleSelectedItem = () => {
        props.handleItem(item);
    };

    const generateProductImage = (images) => {
        if (images && images.productimageone) {
            return `${URL}${images.productimageone}`;
        }
        return `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    return (
        <>
            <div
                className="pizza-item cursor-pointer"
                onClick={handleSelectedItem}
            >
                <img src={generateProductImage(images)} alt={title} />
                <div className="pizza-name">{title}</div>
                <div className="pizza-price">₱ {baseprice.toFixed(2)}</div>
            </div>
        </>
    );
};

const ProductDialog = (props) => {
    const dispatch = useDispatch();
    const { item, signOnData } = props;
    const [visible, setVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { additionalfields, baseprice } = item;

    const productPriceCodes = useSelector((state) => state.product.product);

    console.log('data is', signOnData);

    const { signonid, storesessionid } = signOnData;

    useEffect(() => {
        dispatch(
            appActions.PRODUCT_GET_REQUEST({
                productcodes: item.productcode,
            }),
        );
        setVisible(true);
    }, [item]);

    const handleCancel = () => {
        setVisible(false);
        props.handleDeselectItem();
    };

    const footer = (
        <div>
            <Button
                label="Cancel"
                severity="secondary"
                outlined
                onClick={handleCancel}
            />
        </div>
    );

    console.log('item is', item);

    const handleCart = () => {
        const currentCart = JSON.parse(storage.get('cart'));
        if (currentCart && currentCart.cartid) {
            const data = {
                orderid: currentCart.orderid,
                //"orderid": 10132202408261,
                productpricecode: productPriceCodes[0].productpricecode,
                quantity: '1',
                additionalfields: item.images,
                addons: [],
            };

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `http://tgcs-dev4.tgcs-elevate.com:9000/pos/v1/cart/${currentCart.cartid}/item`,
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                data: data,
            };

            axios
                .request(config)
                .then((response) => {
                    console.log('repsp', JSON.stringify(response.data));
                    // const { sessionid } = response.data
                    // getCartDetail(sessionid)
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            createCart();
        }
        console.log('current', currentCart);
    };

    const getCartDetail = (sessionid) => {
        const currentCart = JSON.parse(storage.get('cart'));
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://tgcs-dev4.tgcs-elevate.com:9000/pos/v1/cart/${currentCart.cartid}/${currentCart.orderid}?sessionid=${sessionid}&status=sales`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
        };

        axios
            .request(config)
            .then((response) => {
                console.log('cart detail', JSON.stringify(response.data));
                storage.set('itemCount', response.data.itemcount);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const createCart = () => {
        let data = JSON.stringify({
            storeid: '1013',
            language: 'en',
            qno: 'Y',
            signonid: signonid,
            usercode: '112',
            terminalid: '2',
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `http://tgcs-dev4.tgcs-elevate.com:9000/pos/v1/cart/new`,
            headers: {
                Authorization: 'test',
                'Content-Type': 'application/json',
            },
            data: data,
        };
        axios
            .request(config)
            .then((response) => {
                console.log('resp', response.data);
                storage.set('cart', JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <Dialog
            header={''}
            visible={visible}
            style={{ width: '450px' }}
            footer={footer}
            onHide={() => setVisible(false)}
        >
            <div className="product-dialog">
                <div className="product-info">
                    <img
                        src={
                            'http://tgcs-dev4.tgcs-elevate.com:9000/media/phstoreimages-2/long%20black.png'
                        }
                        alt={additionalfields && additionalfields.title}
                        className="product-image"
                    />
                    <div className="product-details">
                        <h2>{additionalfields && additionalfields.title}</h2>
                        <div className="product-price">
                            ₱{baseprice.toFixed(2)}
                        </div>
                        <div className="quantity-control">
                            <InputNumber
                                value={quantity}
                                onValueChange={(e) => setQuantity(e.value)}
                                showButtons
                                buttonLayout="horizontal"
                                decrementButtonClassName="p-button-secondary"
                                incrementButtonClassName="p-button-secondary"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                min={1}
                                className="quantity-input"
                            />
                        </div>
                        <Button
                            label="Add to Cart"
                            icon="pi pi-shopping-cart"
                            className="p-button-outlined p-button-secondary"
                            onClick={handleCart}
                        />
                    </div>
                </div>
                {/* <div className="product-description">
                    <h4>Product Information</h4>
                    // {/* <p>{product.description}</p>
                    // <ul>
                    //     {product.ingredients.map((ingredient, index) => (
                    //         <li key={index}>{ingredient}</li>
                    //     ))}
                    // </ul> 
                </div> */}
            </div>
        </Dialog>
    );
};

export default ProductList;
