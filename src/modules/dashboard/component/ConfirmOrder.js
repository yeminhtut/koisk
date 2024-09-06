import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import storage from '../../../utils/storage';
import ImageIcon from '../../../components/ImageIcon';
import OrderConfirmation from './Receipt';

const URL = window?.config?.END_POINT;

const ConfirmOrder = () => {
    const navigate = useNavigate();
    const { cartid, orderid, sessionid } = JSON.parse(storage.get('currCart')) || {};
    const [cartDetail, setCartDetail] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState();
    const [printCart, setPrintCart] = useState()

    useEffect(() => {
        if (cartid) {
            getCartBySession();
        }
        
    }, [cartid]);

    const getCartBySession = async () => {
        try {
            const response = await axios.get(
                `${URL}/pos/v1/cart/${cartid}/${orderid}?&status=sales`,
                {
                    headers: {
                        Authorization: 'test',
                        'Content-Type': 'application/json',
                    },
                    maxBodyLength: Infinity,
                },
            );
            setCartDetail(response.data);
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    const handlePayment = async () => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const data = {
                description: 'cash',
                orderid: orderid,
                payamount: totalamount,
                paytype: 'Cash',
                paytyperef: 'Cash',
            };

            const response = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/payment`,
                JSON.stringify(data),
                {
                    headers: {
                        Authorization: 'test',
                        'Content-Type': 'application/json',
                    },
                    maxBodyLength: Infinity,
                },
            );
            handleCloseCart();
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    const handleCloseCart = async () => {
        try {
            const { cartid, orderid, signonid } = cartDetail;
            const data = {
                orderid: orderid,
                signonid: signonid,
                terminalid: '1',
            };

            const response = await axios.put(
                `${URL}/pos/v1/cart/${cartid}/close`,
                JSON.stringify(data),
                {
                    headers: {
                        Authorization: 'test',
                        'Content-Type': 'application/json',
                    },
                    maxBodyLength: Infinity,
                },
            );
            console.log('check', response.data);
            setOrderNumber(response.data)
            setIsSuccess(true)
            setPrintCart(response.data)
            //navigate("/item-listing", { replace: true });
        } catch (error) {
            console.error('Error closing cart:', error);
        }
    };

    const handleBack = () => {
        navigate('/item-listing', { replace: true });
    };

    const handleGoBack = () => {
        setOrderNumber('')
        navigate('/item-listing', { replace: true });
    }

    const { items, totalamount } = cartDetail;

    const cartView = () => {
        return (
            <div
                className="p-4"
                style={{ maxWidth: '768px', margin: '0 auto' }}
            >
                <div className="flex align-items-center justify-content-between mb-4">
                    <div onClick={handleBack}>
                        <ImageIcon
                            iconName={'back_arrow.png'}
                            style={{ width: '30px', height: '30px' }}
                        />
                    </div>

                    <h2>Confirm Order</h2>
                    <div className='clsbtn'>Clear</div>
                </div>
                <div style={{ paddingBottom: '60px' }}>
                    <div className="mb-4">
                        <h3>Order Items</h3>
                        {items &&
                            items.map((item, index) => (
                                <div className="flex mb-4" key={index}>
                                    <div className="col">1x</div>
                                    <div className="col">
                                        <h4 className="m-0">{item.name}</h4>
                                        <p className="m-0">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="col text-right">
                                        {item.totalamount}
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className="mb-4">
                        <h3>Choose Payment Method</h3>
                        <div className="flex align-items-center justify-content-between">
                            <div
                                className="col-4 justify-content-center align-items-center p-4"
                                style={{ border: '4px solid #D8D8D8' }}
                            >
                                Cash
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="w-full flex align-items-center justify-content-center fixed right-0 bottom-0 p-4 cursor-pointer"
                    style={{
                        backgroundColor: '#78838E',
                        color: '#FFF',
                        fontSize: '32px',
                    }}
                    onClick={handlePayment}
                >
                    Place Order P{totalamount}
                </div>
            </div>
        );
    };

    return (
        <>
            {!isSuccess ? (
                cartView()
            ) : (
                <OrderConfirmation orderNumber={orderNumber} handleBack={handleGoBack} />
            )}
        </>
    );
};

export default ConfirmOrder;
