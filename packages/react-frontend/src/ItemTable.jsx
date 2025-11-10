import React from "react";

function ItemTableHeader() {
  return (
    <thead>
      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>Description</th>
        <th>Location</th>
        <th>Amount</th>
        <th>Tags</th>
        <th>Actions</th>
      </tr>
    </thead>
  );
}

function ItemTableBody({ items, removeItem }) {
  const rows = items.map((item, index) => (
    <tr key={item.id || index}>
      <td>
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            style={{ 
              width: "50px", 
              height: "50px", 
              objectFit: "cover",
              borderRadius: "4px"
            }} 
          />
        ) : (
          <span>No image</span>
        )}
      </td>
      <td>{item.name}</td>
      <td>{item.description}</td>
      <td>{item.location}</td>
      <td>{item.amount}</td>
      <td>{Array.isArray(item.genre) ? item.genre.join(", ") : item.genre}</td>
      <td>
        <button onClick={() => removeItem(index)}>Delete</button>
      </td>
    </tr>
  ));
  return <tbody>{rows}</tbody>;
}

function ItemTable(props) {
  return (
    <table>
      <ItemTableHeader />
      <ItemTableBody
        items={props.items}
        removeItem={props.removeItem}
      />
    </table>
  );
}

export default ItemTable;
