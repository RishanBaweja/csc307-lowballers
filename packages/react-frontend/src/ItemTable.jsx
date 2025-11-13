import React from "react";
import styles from "./itemtable.module.css";

function ItemCard({ item, index, removeItem }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>No image</div>
        )}
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <div className={styles.infoColumn}>
          <span className={styles.info}>{item.location}</span>
          <span className={styles.info}>{item.amount}</span>
        </div>
        {item.genre && (
          <div className={styles.tagsContainer}>
            {Array.isArray(item.genre) ? (
              item.genre.map((tag, idx) => (
                <span key={idx} className={styles.tag}>{tag}</span>
              ))
            ) : (
              <span className={styles.tag}>{item.genre}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemTable(props) {
  if (props.items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No items yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardGrid}>
        {props.items.map((item, index) => (
          <ItemCard 
            key={item.id || index}
            item={item}
            index={index}
            removeItem={props.removeItem}
          />
        ))}
      </div>
    </div>
  );
}

export default ItemTable;
