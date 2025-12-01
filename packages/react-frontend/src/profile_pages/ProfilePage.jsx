import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import ItemCard from "./ItemCard";
import "./profile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/me`, {
          method: "GET",
          credentials: "include", // sends auth cookie
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || data.message || "Failed to load profile");
        }

        const data = await res.json();
        setProfile(data); // { id, username, profilePicture, itemsListed: [...] }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-page">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="profile-page">No profile data.</div>;
  }

  const items = profile.itemsListed || [];
  const itemsCount = items.length;

  return (
    <div className="profile-page">
      <ProfileHeader
        username={profile.username}
        info={`Member id: ${profile.id} • ${itemsCount} item${itemsCount === 1 ? "" : "s"} posted`}
        // add profilePicture or other props here if your header uses them
      />

      <main className="items-list">
        {itemsCount > 0 ? (
          items.map((item) => (
            <ItemCard
              key={item.id}
              name={item.name || item.itemName}
              info={item.description}
            />
          ))
        ) : (
          <p>No items posted</p>
        )}
      </main>
    </div>
  );
}
