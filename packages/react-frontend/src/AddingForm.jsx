import React, { useState } from "react";
import styles from "./addingform.module.css";

function AddingForm(props) {
  const [item, setItem] = useState({
    name: "",
    description: "",
    location: "",
    amount: 0,
    genre: [""],
    image: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setItem(prevItem => ({
          ...prevItem,
          image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  function submitForm() {
    props.handleSubmit(item);
    setItem({
      name: "",
      description: "",
      location: "",
      amount: 0,
      genre: [""],
      image: "",
    });
  }

  return (
    <form className={styles.addItemForm}>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        name="name"
        id="name"
        value={item.name}
        onChange={handleChange}
        required
      />
      <label htmlFor="image">Image</label>
      <input
        type="file"
        name="image"
        id="image"
        accept="image/*"
        onChange={handleImageChange}
      />
      {item.image && (
        <div className={styles.imagePreview}>
          <p>Image Preview:</p>
          <img src={item.image} alt="Preview" />
        </div>
      )}
      <label htmlFor="description">description</label>
      <input
        type="text"
        name="description"
        id="description"
        value={item.description}
        onChange={handleChange}
        required
      />
      <label htmlFor="location">location</label>
      <input
        type="text"
        name="location"
        id="location"
        value={item.location}
        onChange={handleChange}
        required
      />
      <label htmlFor="amount">amount</label>
      <input
        type="number"
        name="amount"
        id="amount"
        value={item.amount}
        min={1}
        max={100}
        onChange={handleChange}
        required
      />
      <label htmlFor="genre">tags</label>
      <input
        type="text"
        name="genre"
        id="genre"
        value={item.genre}
        onChange={handleChange}
        required
      />
      <input type="button" value="Submit" onClick={submitForm} />
    </form>
  );
}

export default AddingForm;
