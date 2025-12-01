export default function ItemCard({ name, info }) {
  return (
    <article className="item-list">
      <header className="item-top">
        <img src="./simplePFP.jpg" alt="Your Profile" className="avatar-post" />
        <h2 className="item-name">{name}</h2>
        <button className="more">...</button>
      </header>
      <br></br>
      <p className="item-info">{info}</p>
    </article>
  );
}
