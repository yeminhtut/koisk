import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import appActions from '../../../appActions';
import storage from '../../../utils/storage';

const WelcomeComponent = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(appActions.STORE_GET_REQUEST(1020));
        getPrinterConfig();
        getTerminalBirInfo()
        getBirInfo()
    }, []);

    const handleClick = () => {
        navigate('/item-listing', { replace: true });
    };
    const getPrinterConfig = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/system/v1/store/device/search/fields?devicegroup=terminal&status=Active&storeid=1020&terminalid=1',
            headers: {
                Authorization: 'test',
            },
        };

        axios
            .request(config)
            .then((response) => {
                //console.log(JSON.stringify(response.data));
                if (response.status != '206') {
                    var addFields = response.data[0].additionalfields;
                    localStorage.setItem(
                        'printerConfigData',
                        JSON.stringify(addFields),
                    );
                    getRegisteredDevices(addFields.posperipherals);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getBirInfo = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/system/v1/store/tag/search/fields?storeid=1020&taggroup=storeprops&tagtype=birinfo&status=Active',
            headers: { 
              'Authorization': 'test'
            }
          };
          
          axios.request(config)
          .then((response) => {
            localStorage.setItem(
                'receiptStoreBIRInfoData',
                JSON.stringify(response.data[0].additionalfields),
            );
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
          
    }

    const getTerminalBirInfo = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/system/v1/store/tag/search/fields?taggroup=tprops&tagtype=birinfo&status=Active&storeid=1020&terminalid=1',
            headers: { 
              'Authorization': 'test'
            }
          };
          
          axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            storage.set('receiptTerminalBIRInfoData', JSON.stringify(response.data[0].additionalfields) )
          })
          .catch((error) => {
            console.log(error);
          });
          
    }

    const getRegisteredDevices = (deviceids) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://tgcs-dev4.tgcs-elevate.com:9000/system/v1/store/device/search/fields?devicegroup=Printer,Virtualprinter&status=Active&storeid=1020&deviceid=PRT503053,EFT467432',
            headers: {
                Authorization: 'test',
            },
        };

        axios
            .request(config)
            .then((response) => {
                if (response.status != '206') {
                    var deviceData = {};
                    deviceData.printerid = '';
                    deviceData.virtualprinterid = '';
                    for (let l = 0; l < response.data.length; l++) {
                        if (
                            response.data[l].devicegroup.toLowerCase() ==
                            'printer'
                        ) {
                            deviceData.printerid = response.data[l].deviceid;
                        }
                        if (
                            response.data[l].devicegroup.toLowerCase() ==
                            'virtualprinter'
                        ) {
                            deviceData.virtualprinterid =
                                response.data[l].deviceid;
                        }
                    }

                    localStorage.setItem(
                        'registeredDeviceData',
                        JSON.stringify(deviceData),
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="background">
            <div className="layer"></div>
            <div
                className="flex flex-column justify-center"
                style={{ zIndex: 1 }}
            >
                <div className="mb-8 flex justify-center">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/icons/harland-logo.png`}
                        alt=""
                        style={{ maxWidth: '300px' }}
                    />
                </div>
                <div>
                    <button
                        className="start-button"
                        style={{ width: '400px' }}
                        onClick={handleClick}
                    >
                        touch to start
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeComponent;
