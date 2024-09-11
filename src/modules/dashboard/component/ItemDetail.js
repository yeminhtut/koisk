import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const ProductDetail = ({ selectedItem, handleAddItem }) => {
    const [quantity, setQuantity] = useState(1);
    const currCart = JSON.parse(storage.get('currCart'));

    const getImage = () => {
        return selectedItem.images
            ? `${URL}/${selectedItem.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    const handleAdd = () => {
        currCart?.cartid ? addItem(currCart) : createCart();
    };

    const addItem = (cart) => {
        const { productpricecode } = selectedItem;
        const { orderid, cartid } = cart;

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
            data
        };

        axios
            .request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                handleAddItem(response.data);
            })
            .catch((error) => console.log(error));
    };

    const createCart = () => {
        const data = JSON.stringify({
            storeid: '1020',
            language: 'en',
            qno: 'Y',
            signonid:
                'a9362bbca0f378d2db96acbb2afb66a2afc85765faeed143476939e56c9cfa2b',
            terminalid: '1',
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
                addItem(response.data);
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
                        <button
                            onClick={() =>
                                setQuantity(quantity > 1 ? quantity - 1 : 1)
                            }
                        >
                            -
                        </button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>
                            +
                        </button>
                    </div>
                    <button className="add-item w-full" onClick={handleAdd}>
                        add to order ₱{' '}
                        {(selectedItem.baseprice * quantity).toFixed(3)}
                    </button>
                </div>
            </div>
        </div>
    );
};