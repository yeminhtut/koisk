import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Toast } from "primereact/toast";
import appActions from "../../../appActions";
import storage from "../../../utils/storage";

const { END_POINT: URL, AuthorizationHeader } = window?.config || {};

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const WelcomeComponent = () => {
    const query = useQuery();
    const storeId = query.get("storeid");
    const terminalId = query.get("terminalid");
   // const { storeId, terminalId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const TouchImage = 'http://188.166.220.103:9000/media/ph-lab-harlan/ad-page_1280x1600.jpg'
    const [bgImg, setBgImg] = useState();
    const toast = useRef(null);
    const [storeid, setStoreId] = useState(storage.get("storeid"));
    const [terminalid, setTerminalId] = useState(storage.get("terminalid"));
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const token = storage.get('token');
        if (!token) {
            navigate('/auth', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        if (storeId) {
            storage.set("storeid", storeId);
            setStoreId(storeId);
        }
        if (terminalId) {
            storage.set("terminalid", terminalId);
            setTerminalId(terminalId);
        }
    }, [storeId, terminalId]);

    useEffect(() => {
        if (storeid && terminalid) {
            dispatch(appActions.STORE_GET_REQUEST(storeid));
            fetchData();
            storage.set("session", AuthorizationHeader);
        }
    }, [storeid, terminalid]);

    const fetchData = async () => {
        try {
            await getSignOnId();
            await getPrinterConfig();
            //await getTerminalBirInfo();
            await getInteractiveConfig();
            await getImage();
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const getImage = () => {
        let config = {
            method: "get",
            url: `${URL}/system/v1/store/tag/search/fields?taggroup=storeprops&tagtype=storeprops&storeid=${storeid}&pagesize=10&pageno=1`,
            headers: {
                Authorization: "7550935cd2bc97f0307afb2aa204e245",
                "Content-Type": "application/json",
            },
        };

        axios
            .request(config)
            .then((response) => {
                if (response.status === 200 && response.data.length > 0) {
                    const { additionalfields } = response.data[0];
                    const { sco, quicklookupcatcode, paymenttimeout } = additionalfields;
                    storage.set("payTimeOut", paymenttimeout)
                    if (sco) {
                        const { start_page } = JSON.parse(sco);
                        setBgImg(start_page ? start_page : '');
                        storage.set("categoryCode", quicklookupcatcode);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getSignOnId = async () => {
        const config = {
            method: "get",
            url: `${URL}/pos/v1/terminal/signon/search/fields?terminalid=${terminalid}&storeid=${storeid}&status=Active`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status === 200) {
                const { signonid } = response.data;
                storage.set("signonid", signonid);
            }
            if (response.status == 206) {
                const { message } = response.data;
                toast.current.show({
                    severity: "error",
                    summary: "Info",
                    detail: message,
                });
                setIsLocked(true);
            }
        } catch (error) {
            console.error("Error fetching SignOn ID", error);
        }
    };

    const getPrinterConfig = async () => {
        const config = {
            method: "get",
            url: `${URL}/system/v1/store/device/search/fields?devicegroup=terminal&status=Active&storeid=${storeid}&terminalid=${terminalid}`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status !== 206) {
                const addFields = response.data[0]?.additionalfields;
                localStorage.setItem(
                    "printerConfigData",
                    JSON.stringify(addFields),
                );
                getRegisteredDevices(addFields.posperipherals);
            }
        } catch (error) {
            console.error("Error fetching Printer Config", error);
        }
    };

    const getInteractiveConfig = async () => {
        const config = {
            method: "get",
            url: `${URL}/cms/v1/prop/config/search/fields?propcode=SCO_INACTIVE_TIMER`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.data.length > 0) {
                const { additionalfields } = response.data[0]
                const { INACTIVITY_TIME, REDIRECT_TIME } = additionalfields
                storage.set('inactiveTimeout', INACTIVITY_TIME) 
                storage.set('redirectTimeout', REDIRECT_TIME) 
            }
            
        } catch (error) {
            console.error("Error fetching Store BIR Info", error);
        }
    };

    const getRegisteredDevices = async (deviceids) => {
        const config = {
            method: "get",
            url: `${URL}/system/v1/store/device/search/fields?devicegroup=Printer,Virtualprinter,Eft&status=Active&storeid=${storeid}`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status !== 206) {
                const deviceData = response.data.reduce(
                    (acc, device) => {
                        const group = device.devicegroup.toLowerCase();
                        if (group === "printer")
                            acc.printerid = device.deviceid;
                        if (group === "virtualprinter")
                            acc.virtualprinterid = device.deviceid;
                        if (group === "eft") acc.eft = device.deviceid;
                        return acc;
                    },
                    { printerid: "", virtualprinterid: "" },
                );
                localStorage.setItem(
                    "registeredDeviceData",
                    JSON.stringify(deviceData),
                );
            }
        } catch (error) {
            console.error("Error fetching Registered Devices", error);
        }
    };

    const handleClick = () => {
        const storeid = storage.get("storeid");
        const terminalid = storage.get("terminalid");
        if (storeid && terminalid && !isLocked) {
            navigate("/item-listing", { replace: true });
        } else {
            toast.current.show({
                severity: "info",
                summary: "Info",
                detail: "Please configure storeid and terminalid",
            });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div
                className="background cursor-pointer"
                onClick={handleClick}
                //style={{ backgroundImage: `url(${bgImg})` }}
            >
                <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
                    {bgImg && (
                        <img 
                            src={bgImg}
                            alt="" 
                            style={{ width: '100vw', height: '100vh', objectFit: 'contain' }} 
                        />
                    )}
                    
                </div>
                
            </div>
            

        </>
    );
};

export default WelcomeComponent;
