import React from "react";
import styles from "./itemtable.module.css";
import API_BASE from "./config";
import { useNavigate } from "react-router-dom";

function ItemCard({ item, index, removeItem }) {
  const navigate = useNavigate();

  async function handleMessageSeller() {
    try {
      const res = await fetch(`${API_BASE}/conversation/start`, {
        method: "POST",
        credentials: "include", // important
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otherUserId: item.userId, // make sure these are correct
          itemId: item.id, // depending on your mapItemToResponse
        }),
      });

      const bodyText = await res.text();
      console.log("start conversation response:", res.status, bodyText);

      if (!res.ok) {
        console.error("Failed to start conversation");
        return;
      }

      const data = JSON.parse(bodyText); // or: const data = await res.json();
      // navigate to conversation
      navigate(`/conversation/${data.conversationId}/messages`);
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  }
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {item.image ? (
          <img src={item.image} alt={item.name} className={styles.image} />
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
                <span key={idx} className={styles.tag}>
                  {tag}
                </span>
              ))
            ) : (
              <span className={styles.tag}>{item.genre}</span>
            )}
            <button
              type="button"
              className={styles.messageButton}
              onClick={handleMessageSeller}
            >
              Message Seller
            </button>
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
