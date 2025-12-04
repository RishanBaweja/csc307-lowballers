import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import ProfileHeader from "./ProfileHeader";
import ItemCard from "./ItemCard";
import "./profile.css";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

export default function ProfilePage() {
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
        onAddItemClick={() => navigate("/add-item")}
      />
      <main className="items-list">
        <ItemCard name="Couch" info="old ahh couch" />
      </main>
    </div>
  );
}
