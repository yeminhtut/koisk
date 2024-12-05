import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [bgImg, setBgImg] = useState();
    const toast = useRef(null);
    const [storeid, setStoreId] = useState(storage.get("storeid"));
    const [terminalid, setTerminalId] = useState(storage.get("terminalid"));

    useEffect(() => {
        const token = storage.get("token");
        const currCart = storage.get("currCart");
        if (!token) {
            navigate("/auth", { replace: true });
        }
        if (currCart) {
            navigate("/item-listing", { replace: true });
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
            getUpsell()
        }
    }, [storeid, terminalid]);

    const fetchData = async () => {
        try {
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
                    const { sco, quicklookupcatcode, paymenttimeout } =
                        additionalfields;
                    storage.set("payTimeOut", paymenttimeout);
                    if (sco) {
                        const { start_page } = JSON.parse(sco);
                        setBgImg(start_page ? start_page : "");
                        storage.set("categoryCode", quicklookupcatcode);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getUpsell = async () => {
        const config = {
            method: "get",
            url: `${URL}/cms/v1/article/search/fields?articletype=Page Content&language=en&section=upsell&articlegroup=hnh-sco`,
            headers: { Authorization: AuthorizationHeader },
        };

        try {
            const response = await axios.request(config);
            if (response.status === 200) {
                const result = response.data.filter(item => 
                    item.fields?.properties?.storeid.split(',').includes(storeid)
                );
                if (result.length > 0) {
                    storage.set('storeUpsell', JSON.stringify(result[0]))
                }
            }
        } catch (error) {
            console.error("No upsell", error);
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
                const { additionalfields } = response.data[0];
                const { INACTIVITY_TIME, REDIRECT_TIME } = additionalfields;
                storage.set("inactiveTimeout", INACTIVITY_TIME);
                storage.set("redirectTimeout", REDIRECT_TIME);
            }
        } catch (error) {
            console.error("Error fetching Store BIR Info", error);
        }
    };

    const getRegisteredDevices = async () => {
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
        if (storeid && terminalid) {
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
            <div className="background cursor-pointer" onClick={handleClick}>
                <div
                    style={{
                        width: "100%",
                        height: "100vh",
                        overflow: "hidden",
                    }}
                >
                    {bgImg && (
                        <img
                            src={bgImg}
                            alt=""
                            style={{
                                width: "100vw",
                                height: "100vh",
                                objectFit: "contain",
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default WelcomeComponent;
