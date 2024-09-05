import React, { useEffect, useMemo, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatInterface = () => {
    const [client, setClient] = useState(null);
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const connectionId = 'bob';

    const connect = () => {
        const socket = new SockJS('http://localhost:9009/websocket');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => onConnected(stompClient),
            onStompError: onError,
        });

        stompClient.activate();
        setClient(stompClient);
    };

    const onConnected = (stompClient) => {
        console.log('onConnected() called');
        stompClient.subscribe(
            `/consumer/${connectionId}/receive`,
            onMessageReceived,
        );

        const msg = {
            header: {
                eventtype: 'connect',
            },
        };

        stompClient.publish({
            destination: `/producer/${connectionId}/send`,
            body: JSON.stringify(msg),
        });
    };

    const onError = (frame) => {
        const msg = {
            header: {
                eventtype: 'error',
            },
            body: {
                error: frame.headers['message'],
            },
        };

        client.publish({
            destination: `/producer/${connectionId}/send`,
            body: JSON.stringify(msg),
        });
        console.log(
            'Could not connect to WebSocket server. Please refresh this page to try again!',
            frame,
        );
    };

    const onMessageReceived = (message) => {
        const payload = JSON.parse(message.body);
        //console.log('received', payload);
        //console.log('message Header: ', payload.header);
        console.log('message Body: ', payload.body);

        if (payload.header.eventtype === 'message') {
            // Handle the message
            setMessageList(messageList.concat(payload.body));
        }
    };

    useEffect(() => {
        connect();
    }, []);

    const sendMessage = () => {
        setMessage('');
        const msg = {
            header: {
                eventtype: 'message',
                action: 'save',
            },
            body: [
                {
                    userId: connectionId,
                    sendToId: 'bob',
                    msgBody: message,
                },
            ],
        };
        client.publish({
            destination: `/producer/${connectionId}/send`,
            body: JSON.stringify(msg),
        });
    };

    return (
        <div className="flex flex-column justify-content-center mt-5">
            <div className="p-3">
                <TabView>
                    <TabPanel header="Chat">
                        <div className="flex justify-content-center flex-column mb-3">
                            {messageList.map((m, k) => (
                                <MessageItem key={k} item={m} />
                            ))}
                        </div>
                    </TabPanel>
                    <TabPanel header="Files">
                        <p>No files available</p>
                    </TabPanel>
                </TabView>
            </div>
            <Divider />
            <div
                className="flex align-items-center py-2 px-3"
                style={{ borderTop: '1px solid #E0E0E0' }}
            >
                <InputTextarea
                    value={message}
                    rows={1}
                    placeholder="Type a message"
                    className="mr-2 w-full"
                    autoResize
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                    onClick={sendMessage}
                    icon="pi pi-send"
                    className="button-rounded button-text"
                />
            </div>
        </div>
    );
};

const MessageItem = (props) => {
    const { item } = props;
    const { userId } = item;

    //label and css for testing purpost, fix it later
    const getLabel = () => {
        if (userId && typeof userId === 'string') {
            return userId.charAt(0).toUpperCase();
        }
        return '';
    };

    const getCss = () => {
        if (userId == 'bob') {
            return 'mr-2 ml-auto';
        }
        return 'mr-2';
    };
    return (
        <div className="flex align-items-center my-2">
            <Avatar label={getLabel()} shape="circle" className={getCss()} />
            <div>
                <h5 className="m-0">{userId}</h5>
                <p>message here</p>
                {/* <small className="text-secondary">1:59pm</small> */}
            </div>
        </div>
    );
};

export default ChatInterface;
