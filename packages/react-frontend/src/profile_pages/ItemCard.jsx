export default function ItemCard({ name, info, image, profilePicture }) {
  const avatarSrc = profilePicture || "./simplePFP.jpg";

  return (
    <article className="item-list">
      <header className="item-top">
        <img
          src={avatarSrc}
          alt="Your Profile"
          className="avatar-post"
        />
        <h2 className="item-name">{name}</h2>
      </header>

      {image && (
        <img
          src={image}
          alt={name}
          className="item-photo"
          style={{ width: "50%", borderRadius: "8px", marginTop: "10px" }}
        />
      )}

      <br />
      <p className="item-info">{info}</p>
    </article>
  );
}
