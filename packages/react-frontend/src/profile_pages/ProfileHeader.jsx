// ProfileHeader.jsx
export default function ProfileHeader({
  username,
  bio,
  meta,
  profilePicture,
  onEditClick,
  onAddItemClick,
}) {
  const avatarSrc = profilePicture || "./simplePFP.jpg";

  return (
    <header className="profile-header">
      <div className="profile-topbar">
        <input className="searchabr" placeholder="Search for Item" />

        <button className="add-item" type="button" onClick={onAddItemClick}>
          +
        </button>
        <button className="inbox">Inbox</button>
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
          <div className="username">{username}</div>
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

