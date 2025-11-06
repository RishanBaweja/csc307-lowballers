import React, { useState } from "react";

function Form(props) {
  const [person, setPerson] = useState({
    id: "",
    username: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setPerson(prev => ({ ...prev, [name]: value }));
  }


  function submitForm() {
    props.handleSubmit(person);
    setPerson({ username: "", password: "" });
    <input type="button" value="Submit" onClick={submitForm} />;
  }

  return (
    <form>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        name="username"
        id="username"
        value={person.username}
        onChange={handleChange}
      />
      <label htmlFor="password">Password</label>
      <input
        type="text"
        name="password"
        id="password"
        value={person.password}
        onChange={handleChange}
      />
      <input type="button" value="Submit" onClick={submitForm} />
    </form>
  );
}

export default Form;
