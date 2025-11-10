import React, { useState } from "react";

function AddingForm(props) {
  const [item, setItem] = useState({
    id: "",
    userId: "",
    name: "",
    description: "",
    location: "",
    amount: 0,
    genre: [""],
    image: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value
    }));
  }

  function submitForm() {
    props.handleSubmit(item);
    setItem({
      id: "",
      userId: "",
      name: "",
      description: "",
      location: "",
      amount: 0,
      genre: [""],
      image: ""
    });
  }

  return (
    <form>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        name="name"
        id="name"
        value={item.name}
        onChange={handleChange}
        required
      />
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
        min = {1}
        max = {100}
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
      <input type="button" value="Submit" onClick={submitForm}/>
    </form>
  );
}

export default AddingForm;
