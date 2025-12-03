import React, { useState, useEffect } from "react";
import ProfileHeader from "./ProfileHeader";
import ItemCard from "./ItemCard";
import "./profile.css";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include", // sends auth cookie
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || data.message || "Failed to load profile"
          );
        }

        const data = await res.json();
        setProfile(data);
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

  const avatarSrc = profile.profilePicture
    ? `${API_BASE}${profile.profilePicture}`
    : "./simplePFP.jpg";

  return (
    <div className="profile-page">
      <ProfileHeader
        username={profile.username}
        bio={profile.bio}
        meta={`Member id: ${profile.id} • ${itemsCount} item${
          itemsCount === 1 ? "" : "s"
        } posted`}
        profilePicture={avatarSrc}
        onEditClick={() => navigate("/profile/edit")}
      />

      <main className="items-list">
        {itemsCount > 0 ? (
          items.map((item) => (
            <ItemCard
              key={item.id}
              name={item.name || item.itemName}
              info={item.description}
              image={item.image}
              profilePicture={avatarSrc}
            />
          ))
        ) : (
          <p>No items posted</p>
        )}
      </main>
    </div>
  );
}
