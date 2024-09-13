import React, { useState, useEffect } from "react";

// const AdsArea = () => {
//     return (
//         <div className="sticky-image-area col-6 d-none d-md-block col-6">
//             <img
//                 src="http://tgcs-dev4.tgcs-elevate.com:9000/media/koisk_adv.jpg"
//                 alt="Coffee"
//                 className="sticky-image"
//             />
//         </div>
//     );
// };

const ad_images = [
    { 
        "image": "http://tgcs-dev4.tgcs-elevate.com:9000/media/koisk_adv.jpg",
        "display_for": 20,
    },
    { 
        "image": "http://tgcs-dev4.tgcs-elevate.com:9000/media/190712_harlanholden_7.png",
        "display_for": 10,
    },
]



const AdsArea = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Get the current image's display time in milliseconds
    const displayTime = ad_images[currentImageIndex].display_for * 1000;

    // Fade out before switching images
    const fadeOutTimeout = setTimeout(() => {
      setFade(false);
    }, displayTime - 1000); // Fade out 1 second before switching image

    // Switch to the next image after the current one’s display time
    const switchImageTimeout = setTimeout(() => {
      setFade(true); // fade in
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ad_images.length); // Cycle through images
    }, displayTime);

    return () => {
      clearTimeout(switchImageTimeout);
      clearTimeout(fadeOutTimeout);
    };
  }, [currentImageIndex, ad_images]);

  return (
    <div className="sticky-image-area col-6 d-none d-md-block col-6" style={{  padding: '0px' }}>
        <div className="ad-container">
      {ad_images.map((ad, index) => (
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