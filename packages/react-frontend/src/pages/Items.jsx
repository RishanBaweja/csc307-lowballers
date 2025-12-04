import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ItemTable from "../ItemTable";
import API_BASE from "../config";

function Items() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Fetch items from backend on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await fetch(`${API_BASE}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items_list || []);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  async function searchItems(query, location) {
    if (!query.trim() && !location) {
      fetchItems(); // If both search and location filter are empty, fetch all items
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (location) params.append('location', location);
      
      const response = await fetch(`${API_BASE}/items/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items_list || []);
      } else {
        console.error("Failed to search items");
      }
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    searchItems(searchQuery, locationFilter);
  }

  async function removeItem(index) {
    const itemToDelete = items[index];
    try {
      const response = await fetch(
        `${API_BASE}/items/${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
      } else {
        console.error("Failed to delete item");
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Make sure the backend is running.");
    }
  }

  return (
    <div className="items-page">
      <h1>All Items</h1>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search items by name or location..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        
        {/* Location Filter Dropdown */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="San Luis Obispo">San Luis Obispo</option>
          <option value="Morro Bay">Morro Bay</option>
          <option value="Atascadero">Atascadero</option>
          <option value="Pismo Beach">Pismo Beach</option>
          <option value="Santa Maria">Santa Maria</option>
        </select>
        
        <button 
          type="submit" 
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
        {(searchQuery || locationFilter) && (
          <button 
            type="button"
            onClick={() => {
              setSearchQuery("");
              setLocationFilter("");
              fetchItems();
            }}
          >
            Clear
          </button>
        )}
      </form>

      <button onClick={() => navigate("/add-item")}>Add New Item</button>
      <ItemTable items={items} removeItem={removeItem} />
      
      {(searchQuery || locationFilter) && items.length === 0 && !isSearching && (
        <p>
          No items found{searchQuery && ` for "${searchQuery}"`}{locationFilter && ` in ${locationFilter}`}
        </p>
      )}
    </div>
  );
}

export default Items;
