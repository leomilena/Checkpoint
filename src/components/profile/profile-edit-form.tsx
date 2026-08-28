"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/avatar";
import { Field, inputClass } from "@/components/ui/field";

const COLOR_PALETTE = ["#FFB238", "#3DDC97", "#5FB4FF", "#C792FF", "#FF8A65", "#4DD0E1", "#F06292", "#AED581"];

export function ProfileEditForm({
  initialName,
  initialBio,
  initialColor,
  initialImageUrl,
}: {
  initialName: string;
  initialBio: string;
  initialColor: string;
  initialImageUrl: string | null;
}) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarColor, setAvatarColor] = useState(initialColor);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(initialImageUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "avatar");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setAvatarImageUrl(data.url);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, avatarColor, avatarImageUrl }),
    });
    if (res.ok) {
      await update({ name, avatarColor, avatarImageUrl });
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5">
      <div className="flex items-center gap-4">
        <Avatar name={name} color={avatarColor} imageUrl={avatarImageUrl} size={56} />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-fit rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent"
          >
            Subir foto
          </button>
          {avatarImageUrl && (
            <button
              type="button"
              onClick={() => setAvatarImageUrl(null)}
              className="w-fit text-xs text-muted hover:text-danger"
            >
              Usar color en su lugar
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </div>
      </div>

      {!avatarImageUrl && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de avatar">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={avatarColor === c}
              aria-label={`Color ${c}`}
              onClick={() => setAvatarColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                avatarColor === c ? "border-text" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      <Field label="Nombre" htmlFor="name">
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Biografía" htmlFor="bio">
        <textarea
          id="bio"
          value={bio}
          maxLength={280}
          rows={3}
          onChange={(e) => setBio(e.target.value)}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      {saved && <p className="text-sm text-accent2">Perfil actualizado.</p>}
    </form>
  );
}
