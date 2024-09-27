import React, { useState, useEffect } from "react";
import axios from "axios";


const { END_POINT: URL, terminalid, storeid, AuthorizationHeader } = window?.config || {};

const AdsArea = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [leftImages, setLeftImages] = useState([])

  useEffect(() => {
    getImages()
  }, [])

  const getImages = () => {
    let config = {
        method: 'get',
        url: `${URL}/system/v1/store/tag/search/fields?taggroup=storeprops&tagtype=storeprops&storeid=${storeid}&pagesize=10&pageno=1`,
        headers: { 
            'Authorization': AuthorizationHeader,
            'Content-Type': 'application/json', 
        }
    };

    axios.request(config)
    .then((response) => {
        if (response.status === 200 && response.data.length > 0) {
            const { additionalfields } = response.data[0]
            const { sco } = additionalfields
            if (sco) {
              const { ad_images } = JSON.parse(sco)
              setLeftImages(ad_images)
            }
            
        }
    })
    .catch((error) => {
        console.log(error);
    });

}

  useEffect(() => {
    if (leftImages.length > 0) {
      // Get the current image's display time in milliseconds
    const displayTime = leftImages[currentImageIndex].display_for * 1000;

    // Fade out before switching images
    const fadeOutTimeout = setTimeout(() => {
      setFade(false);
    }, displayTime - 1000); // Fade out 1 second before switching image

    // Switch to the next image after the current one’s display time
    const switchImageTimeout = setTimeout(() => {
      setFade(true); // fade in
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % leftImages.length); // Cycle through images
    }, displayTime);

    return () => {
      clearTimeout(switchImageTimeout);
      clearTimeout(fadeOutTimeout);
    };
    }
    
  }, [currentImageIndex, leftImages]);

  return (
    <div className="sticky-image-area col-6 d-none d-md-block col-6" style={{  padding: '0px' }}>
        <div className="ad-container">
      {leftImages.map((ad, index) => (
        <img
          key={index}
          src={ad.image}
          alt={`Ad ${index + 1}`}
          className={`ad-image sticky-image ${index === currentImageIndex ? (fade ? "fade-in" : "fade-out") : ""}`}
          style={{ display: index === currentImageIndex ? "block" : "none" }} // Only show the current image
        />
      ))}
    </div>
    </div>
    
  );
};


export default AdsArea