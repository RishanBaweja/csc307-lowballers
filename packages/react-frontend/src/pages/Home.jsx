import Table from "../Table.jsx";
import Form from "../Form.jsx";
import { useOutletContext } from "react-router-dom";

export default function Home() {
  const { characters, updateList, removeOneCharacter } = useOutletContext();
  return (
    <div className="container">
      <Table characterData={characters} removeCharacter={removeOneCharacter} />
      <Form handleSubmit={updateList} />
    </div>
  );
}
