import React from "react";
import profile from "../../assets/images/profile.png";
import default_profile from "../../assets/images/default-profile.jpg";

const Card = ({ imageUrl, description, name, ethAddress }) => {
  const address = ethAddress.slice(0, 7) + "...." + ethAddress.slice(-7);
  return (
    <div className="artist-card-container">
      <div className="artist-img-border">
        <div className="artist-img-container">
          <img src={imageUrl} alt="" />
        </div>
      </div>
      {name ? (
        <div className="artist-title">
          <b style={{ fontSize: "18px" }}>{name}</b>
        </div>
      ) : (
        // <div className="user">
        <div className="artist-title">
          <h4 className="user-name"> @{address}</h4>
        </div>
      )}

      <div className="desc">
        {description}
        {/* Music Artist. Rapper. */}
      </div>
    </div>
  );
};

const profile_image = [profile, default_profile];

Card.defaultProps = {
  ethAddress: "",
  // imageUrl: profile_image[Math.round(Math.random())]
  imageUrl: profile_image[0],
};

export default Card;
