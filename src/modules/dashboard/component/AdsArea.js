import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import storage from "../../../utils/storage";
import FloatingHomeButton from "../../../components/FloatingHomeButton";

const { END_POINT: URL, AuthorizationHeader } = window?.config || {};

const AdsArea = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fade, setFade] = useState(true);
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
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (leftImages.length > 0) {
            // Get the current image's display time in milliseconds
            const displayTime =
                leftImages[currentImageIndex].display_for * 1000;

            // Fade out before switching images
            const fadeOutTimeout = setTimeout(() => {
                setFade(false);
            }, displayTime - 1000); // Fade out 1 second before switching image

            // Switch to the next image after the current one’s display time
            const switchImageTimeout = setTimeout(() => {
                setFade(true); // fade in
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % leftImages.length,
                ); // Cycle through images
            }, displayTime);

            return () => {
                clearTimeout(switchImageTimeout);
                clearTimeout(fadeOutTimeout);
            };
        }
    }, [currentImageIndex, leftImages]);

    const handleHomeClick = () => {
      navigate('/'); // Navigate to your home page route
  };

    return (
        <div
            className="sidebar col-6 d-none d-md-block col-6 p-0"
            style={{ padding: "0px" }}
        >
            {/* <div className="ad-container">
                {leftImages.map((ad, index) => (
                    <img
                        key={index}
                        src={ad.image}
                        alt={`Ad ${index + 1}`}
                        className={`ad-image sticky-image ${index === currentImageIndex ? (fade ? "fade-in" : "fade-out") : ""}`}
                        style={{
                            display:
                                index === currentImageIndex ? "block" : "none",
                        }} // Only show the current image
                    />
                ))}
            </div> */}
            <div className="ad-container">
                <img
                    //src={leftImages[0]?.image}
                    src="https://res.cloudinary.com/xenova/image/upload/c_pad,w_512,h_768/v1729664892/ad-page_1280x1600_mtkdtw.jpg"
                    alt={`Ad`}
                    className={`ad-image sticky-image`}
                />
            </div>
            <FloatingHomeButton onHomeClick={handleHomeClick} />
        </div>
    );
};

export default AdsArea;
