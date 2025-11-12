export default function ProfileHeader({ username, info }) {
  return (
    <header className="profile-header">
      <div className="profile-topbar">
        <input className="searchabr" placeholder="Search for Item" />
        
          <button className="add-item">+</button>
          <button className="inbox">Inbox</button>
          <img src="./example.png" alt="Your Profile" className ="avatar-sm"/>
      </div>

      <div className="profile-row">
        <img src="./example.png" alt="PFP" className = "avatar-lg"/>
        <div className="username">
          {username}
        </div>
      </div>

      <br />
      <div className="my-text">About</div>
      <div className="info">
          {info}
      </div>
    </header>
  );
}
