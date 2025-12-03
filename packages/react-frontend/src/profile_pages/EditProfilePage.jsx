import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import API_BASE from "../config";

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentProfilePicture, setCurrentProfilePicture] = useState("");
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load current profile so we can prefill fields
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setDisplayName(data.displayName || data.username || "");
        setBio(data.bio || "");
        setCurrentProfilePicture(data.profilePicture || "");
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let profilePictureUrl = currentProfilePicture;

      // 1) If user selected a new file, upload it first
      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("profilePicture", newAvatarFile);

        const uploadRes = await fetch(
          `${API_BASE}/me/profile-picture`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(
            data.error || "Failed to upload profile picture"
          );
        }

        const uploadData = await uploadRes.json();
        profilePictureUrl = uploadData.profilePicture; // e.g. "/uploads/abc.jpg"
      }

      // 2) Now update the rest of the profile (and profilePicture)
      const patchRes = await fetch(`${API_BASE}/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          bio,
          profilePicture: profilePictureUrl,
        }),
      });

      if (!patchRes.ok) {
        const data = await patchRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      // Success – go back to profile page
      navigate("/profile");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/profile");
  }

  // Build a usable img src (backend returns "/uploads/..." usually)
  const currentAvatarSrc = currentProfilePicture
    ? `${API_BASE}${currentProfilePicture}`
    : "";

  return (
    <div className="profile-page">
      <form className="edit-profile-form" onSubmit={handleSave}>
        <h1>Edit profile</h1>

        <label className="form-label">
          Display name
          <input
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="form-label">
          Bio
          <textarea
            className="form-textarea"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <label className="form-label">
          Profile picture
          {currentAvatarSrc && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={currentAvatarSrc}
                alt="Current avatar"
                style={{ maxWidth: 120, borderRadius: "50%" }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewAvatarFile(e.target.files[0] || null)}
          />
        </label>

        {error && (
          <div className="form-error" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}

        <div className="form-buttons">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

