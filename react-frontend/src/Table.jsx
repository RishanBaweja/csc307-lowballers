// src/Table.jsx
import React from "react";

function TableHeader() {
  return (
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Job</th>
        <th>Delete</th>
      </tr>
    </thead>
  );
}

function TableBody({ characterData, removeCharacter }) {
  const rows = characterData.map((row, index) => (
    <tr key={index}>
      <td>{row._id ?? row.id}</td>
      <td>{row.name}</td>
      <td>{row.job}</td>
      <td>
        <button onClick={() => removeCharacter(index)}>Delete</button>
      </td>
    </tr>
  ));
  return <tbody>{rows}</tbody>;
}

function Table(props) {
  return (
    <table>
      <TableHeader />
      <TableBody
        characterData={props.characterData}
        removeCharacter={props.removeCharacter}
      />
    </table>
  );
}

export default Table;
