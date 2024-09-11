import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Button } from 'primereact/button';
import storage from '../../../utils/storage';
import ImageIcon from '../../../components/ImageIcon';
import OrderConfirmation from './Receipt';

const URL = window?.config?.END_POINT;
const terminalid = window?.config?.terminalid;

const ConfirmOrder = () => {
    const navigate = useNavigate();
    const [currCart, setCurrCart] = useState(() => JSON.parse(storage.get('currCart')) || {});
    const { cartid, orderid } = currCart;

    const [sessionid, setSessionId] = useState(() => storage.get('sessionid')) || '';
    const [cartDetail, setCartDetail] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [printCart, setPrintCart] = useState(null);

    useEffect(() => {
        if (cartid) {
            fetchCartDetails();
        }
    }, [cartid]);

    const fetchCartDetails = async (newSession) => {
        try {
            const { data } = await axios.get(`${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${newSession ? newSession : sessionid}&status=sales`, {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
            });
            setCartDetail(data);
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    const handlePayment = async () => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const paymentData = {
                description: 'cash',
                orderid,
                payamount: totalamount,
                paytype: 'Cash',
                paytyperef: 'Cash',
            };

            await axios.post(`${URL}/pos/v1/cart/${cartid}/payment`, JSON.stringify(paymentData), {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
            });
            closeCart();
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    const closeCart = async () => {
        try {
            const { cartid, orderid, signonid } = cartDetail;
            const closeData = {
                orderid,
                signonid,
                terminalid,
            };

            const { data } = await axios.put(`${URL}/pos/v1/cart/${cartid}/close`, JSON.stringify(closeData), {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
            });
            setOrderNumber(data);
            setIsSuccess(true);
            setPrintCart(data);
        } catch (error) {
            console.error('Error closing cart:', error);
        }
    };

    const voidCart = async () => {
        try {
            const { cartid, orderid } = cartDetail;
            await axios.put(`${URL}/pos/v1/cart/${cartid}/void`, JSON.stringify({ orderid }), {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
            });
            storage.remove('currCart');
            navigate('/item-listing', { replace: true });
        } catch (error) {
            console.error('Error voiding cart:', error);
        }
    };

    const handleBack = () => navigate('/item-listing', { replace: true });

    const updateCartItem = async (item, quantity) => {
        try {
            const { idx } = item;
            const { orderid, cartid } = cartDetail;
            const data = {
                orderid,
                idx,
                quantity,
                addons: [],
            };

            const repsonse = await axios.post(`${URL}/pos/v1/cart/${cartid}/item`, JSON.stringify(data), {
                headers: {
                    Authorization: 'test',
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
            });
            const { sessionid } = repsonse.data
            console.log('data', repsonse.data)
            storage.set('sessionid', sessionid)
            fetchCartDetails(sessionid);
        } catch (error) {
            console.error('Error updating cart item:', error);
        }
    };

    const removeOrderItem = (item) => updateCartItem(item, 0);

    const increaseOrderItem = (item) => updateCartItem(item, item.quantity + 1);

    const decreaseOrderItem = (item) => {
        if (item.quantity > 1) {
            updateCartItem(item, item.quantity - 1);
        }
    };

    const CartView = () => (
        <div className="p-4" style={{ maxWidth: '768px', margin: '0 auto' }}>
            <div className="flex align-items-center justify-content-between mb-4">
                <div onClick={handleBack}>
                    <ImageIcon iconName={'back_arrow.png'} style={{ width: '30px', height: '30px' }} />
                </div>
                <h2>Confirm Order</h2>
                <div className="clsbtn" onClick={voidCart}>
                    Clear
                </div>
            </div>
            <div style={{ paddingBottom: '60px' }}>
                <div className="mb-4">
                    <h3>Order Items</h3>
                    {cartDetail.items?.map((item, index) => (
                        <OrderItem
                            item={item}
                            key={index}
                            removeOrderItem={removeOrderItem}
                            increaseOrderItem={increaseOrderItem}
                            decreaseOrderItem={decreaseOrderItem}
                        />
                    ))}
                </div>
                <div className="mb-4">
                    <h3>Choose Payment Method</h3>
                    <div className="col-4 justify-content-center align-items-center p-4" style={{ border: '4px solid #D8D8D8' }}>
                        Cash
                    </div>
                </div>
            </div>
            <div
                className="w-full flex align-items-center justify-content-center fixed right-0 bottom-0 p-4 cursor-pointer"
                style={{ backgroundColor: '#78838E', color: '#FFF', fontSize: '32px' }}
                onClick={handlePayment}
            >
                Place Order P{cartDetail.totalamount}
            </div>
        </div>
    );

    return !isSuccess ? <CartView /> : <OrderConfirmation orderNumber={orderNumber} handleBack={handleBack} />;
};

const OrderItem = ({ item, removeOrderItem, increaseOrderItem, decreaseOrderItem }) => {
    const [quantity, setQuantity] = useState(item.quantity);

    const increaseItemQty = () => {
        setQuantity(quantity + 1);
        increaseOrderItem(item);
    };

    const decreaseItemQty = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
            decreaseOrderItem(item);
        }
    };

    return (
        <div className="flex mb-4 align-items-center">
            <div className="col">
                <h4 className="m-0">{item.name}</h4>
                <p className="m-0">{item.description}</p>
            </div>
            <div className="col">
                <div className="order-selector flex justify-content-center align-items-center my-2">
                    <button onClick={decreaseItemQty}>-</button>
                    <span className="mx-4">{quantity}x</span>
                    <button onClick={increaseItemQty}>+</button>
                </div>
            </div>
            <div className="col text-right">{item.totalamount}</div>
            <div className="col text-right pr-0 flex justify-content-end">
                <Button label="Remove" onClick={() => removeOrderItem(item)} severity="danger" text />
            </div>
        </div>
    );
};

export default ConfirmOrder;
