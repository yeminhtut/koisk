import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import appActions from '../../../appActions';
import storage from '../../../utils/storage';
import TouchImage from '../../../assets/icons/touch-bg.png'

const { END_POINT: URL, terminalid, storeid, AuthorizationHeader } = window?.config || {};

const WelcomeComponent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [bgImg , setBgImg] = useState('')

    useEffect(() => {
        dispatch(appActions.STORE_GET_REQUEST(storeid));
        fetchData();
        storage.set('session', 'test')
    }, [dispatch]);

    const fetchData = async () => {
        try {
            await getSignOnId();
            await getPrinterConfig();
            await getTerminalBirInfo();
            await getBirInfo();
            await getImage();
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const getImage = () => {
        let config = {
            method: 'get',
            url: `${URL}/system/v1/store/tag/search/fields?taggroup=storeprops&tagtype=storeprops&storeid=${storeid}&pagesize=10&pageno=1`,
            headers: { 
                'Authorization': '7550935cd2bc97f0307afb2aa204e245',
                'Content-Type': 'application/json', 
            }
        };

        axios.request(config)
        .then((response) => {
            if (response.status === 200 && response.data.length > 0) {
                const { additionalfields } = response.data[0]
                const { sco } = additionalfields
                if (sco) {
                    const { start_page } = JSON.parse(sco)
                    setBgImg(start_page ? start_page : TouchImage )
                }
                
            }
        })
        .catch((error) => {
            console.log(error);
        });

    }

    const getSignOnId = async () => {
        const config = {
            method: 'get',
            url: `${URL}/pos/v1/terminal/signon/search/fields?terminalid=${terminalid}&storeid=${storeid}&status=Active`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status === 200) {
                const { signonid } = response.data;
                storage.set('signonid', signonid);
            }
        } catch (error) {
            console.error("Error fetching SignOn ID", error);
        }
    };

    const getPrinterConfig = async () => {
        const config = {
            method: 'get',
            url: `${URL}/system/v1/store/device/search/fields?devicegroup=terminal&status=Active&storeid=${storeid}&terminalid=${terminalid}`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status !== 206) {
                const addFields = response.data[0]?.additionalfields;
                localStorage.setItem('printerConfigData', JSON.stringify(addFields));
                getRegisteredDevices(addFields.posperipherals);
            }
        } catch (error) {
            console.error("Error fetching Printer Config", error);
        }
    };

    const getBirInfo = async () => {
        const config = {
            method: 'get',
            url: `${URL}/system/v1/store/tag/search/fields?storeid=${storeid}&taggroup=storeprops&tagtype=birinfo&status=Active`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            localStorage.setItem('receiptStoreBIRInfoData', JSON.stringify(response.data[0]?.additionalfields));
        } catch (error) {
            console.error("Error fetching Store BIR Info", error);
        }
    };

    const getTerminalBirInfo = async () => {
        const config = {
            method: 'get',
            url: `${URL}/system/v1/store/tag/search/fields?taggroup=tprops&tagtype=birinfo&status=Active&storeid=${storeid}&terminalid=${terminalid}`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            storage.set('receiptTerminalBIRInfoData', JSON.stringify(response.data[0]?.additionalfields));
        } catch (error) {
            console.error("Error fetching Terminal BIR Info", error);
        }
    };

    const getRegisteredDevices = async (deviceids) => {
        const config = {
            method: 'get',
            url: `${URL}/system/v1/store/device/search/fields?devicegroup=Printer,Virtualprinter&status=Active&storeid=${storeid}&deviceid=PRT503053,EFT467432`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status !== 206) {
                const deviceData = response.data.reduce(
                    (acc, device) => {
                        const group = device.devicegroup.toLowerCase();
                        if (group === 'printer') acc.printerid = device.deviceid;
                        if (group === 'virtualprinter') acc.virtualprinterid = device.deviceid;
                        return acc;
                    },
                    { printerid: '', virtualprinterid: '' }
                );
                localStorage.setItem('registeredDeviceData', JSON.stringify(deviceData));
            }
        } catch (error) {
            console.error("Error fetching Registered Devices", error);
        }
    };

    const handleClick = () => {
        navigate('/item-listing', { replace: true });
    };

    return (
        <div className="background cursor-pointer"  onClick={handleClick} style={{ backgroundImage: `url(${bgImg})` }}>
            <div className="layer"></div>
            <div className="flex flex-column justify-center" style={{ zIndex: 1 }}>
                <div className="mb-8 flex justify-center">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/icons/harland-logo.png`}
                        alt="Harland Logo"
                        style={{ maxWidth: '300px' }}
                    />
                </div>
                <div>
                    <button className="start-button" style={{ width: '400px' }}>
                        touch to start
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeComponent;
