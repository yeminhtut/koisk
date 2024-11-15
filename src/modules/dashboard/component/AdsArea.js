import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import storage from "../../../utils/storage";
//import FloatingHomeButton from "../../../components/FloatingHomeButton";
import adDefault from "../../../assets/images/ad-default.jpg"

const { END_POINT: URL, AuthorizationHeader } = window?.config || {};

const AdsArea = () => {
    const [leftImages, setLeftImages] = useState([]);
    const storeid = storage.get("storeid");
    const navigate = useNavigate();

    useEffect(() => {
        getImages();
    }, []);

    const getImages = () => {
        let config = {
            method: "get",
            url: `${URL}/system/v1/store/tag/search/fields?taggroup=storeprops&tagtype=storeprops&storeid=${storeid}&pagesize=10&pageno=1`,
            headers: {
                Authorization: AuthorizationHeader,
                "Content-Type": "application/json",
            },
        };

        axios
            .request(config)
            .then((response) => {
                if (response.status === 200 && response.data.length > 0) {
                    const { additionalfields } = response.data[0];
                    const { sco } = additionalfields;
                    if (sco) {
                        const { ad_images } = JSON.parse(sco);
                        setLeftImages(ad_images);
                    }
                }
                else {
                    setLeftImages([{"image": adDefault}])
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleHomeClick = () => {
      navigate('/'); // Navigate to your home page route
  };

    return (
        <div
            className="sidebar col-6 d-none  p-0"
            style={{ padding: "0px" }}
        >
            <div className="ad-container">
                <img
                    src={leftImages[0]?.image}
                    alt={`Ad`}
                    className={`ad-image sticky-image`}
                />
            </div>
            {/* <FloatingHomeButton onHomeClick={handleHomeClick} /> */}
        </div>
    );
};

export default AdsArea;
