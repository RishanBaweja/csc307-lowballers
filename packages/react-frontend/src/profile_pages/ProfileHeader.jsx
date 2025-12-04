// ProfileHeader.jsx
import { useOutletContext, useNavigate } from "react-router-dom";

export default function ProfileHeader({
  displayName,
  username,
  bio,
  meta,
  profilePicture,
  onEditClick,
  onAddItemClick,
}) {

  const navigate = useNavigate();
  
  const nameToShow = displayName || username;
  const avatarSrc = profilePicture || "./simplePFP.jpg";

  return (
    <header className="profile-header">
      <div className="profile-topbar">

        <button className="add-item" type="button" onClick={onAddItemClick}>
          +
        </button>
        <button className="inbox" onClick={() => navigate("/inbox")}>
        Inbox
      </button>
        <img
          src={avatarSrc}
          alt="PFP"
          className="avatar-sm"
        />
      </div>

      <div className="profile-row">
        <img
          src={avatarSrc}
          alt="PFP"
          className="avatar-lg"
        />
        <div className="username-block">
          <div className="username">{nameToShow}</div>
          {meta && <div className="meta">{meta}</div>}
          <button className="edit-profile-btn" onClick={onEditClick}>
            Edit profile
          </button>
        </div>
      </div>

      <br />
      <div className="my-text">About</div>
      <div className="info">{bio || "Tell people about yourself..."}</div>
    </header>
  );
}
