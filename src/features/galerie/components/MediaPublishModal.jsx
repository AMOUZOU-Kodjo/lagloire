import { useEffect, useRef, useState } from "react";
import { Upload, ImagePlus, Music2, Film, Info, HardDriveUpload, Link2, X, FileAudio2 } from "lucide-react";
import { Modal, Input, Textarea, Button } from "../../../components/ui";
import { mediaApi } from "../../../api/media.api";
import { mediaFullUrl } from "../../../api/http";
import { useAuthStore } from "../../../store/authStore";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const TYPES = [
  { value: "PHOTO", label: "Photo", icon: ImagePlus, accept: "image/*" },
  { value: "AUDIO", label: "Audio", icon: Music2, accept: "audio/*" },
  { value: "VIDEO", label: "Vidéo", icon: Film, accept: "video/*" },
];

const MAX_SIZE = 50 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

export default function MediaPublishModal({ open, onClose }) {
  const [mode, setMode] = useState("file");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PHOTO");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  const currentType = TYPES.find((t) => t.value === type);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [file]);

  const isStaff = ["ADMIN", "APOTRE"].includes(useAuthStore((s) => s.user?.role));

  const mutation = useMutationFeedback({
    mutationFn: async (payload) => {
      let mediaUrl = payload.url;
      if (payload.file) {
        const res = await mediaApi.upload(payload.file);
        mediaUrl = mediaFullUrl(res.data.mediaUrl);
      }
      return mediaApi.create({
        title: payload.title,
        type: payload.type,
        url: mediaUrl,
        thumbnailUrl: payload.thumbnailUrl,
        description: payload.description,
      });
    },
    invalidate: [["media"]],
    successMessage: isStaff
      ? "Média publié ! Il est déjà visible dans la galerie."
      : "Média soumis ! Il apparaîtra dans la galerie après validation.",
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setTitle("");
    setType("PHOTO");
    setUrl("");
    setFile(null);
    setThumbnailUrl("");
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  const valid =
    Boolean(title.trim()) &&
    (mode === "link" ? Boolean(url.trim()) : Boolean(file));

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    mutation.mutate({
      title: title.trim(),
      type,
      url: mode === "link" ? url.trim() : undefined,
      file: mode === "file" ? file : undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Publier un média">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="TITRE"
          required
          placeholder="Ex. Culte de dimanche — août 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={mutation.isPending}
        />

        <div>
          <span className="text-xs font-mono block mb-1.5 text-soft">TYPE</span>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setType(t.value);
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={mutation.isPending}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition ${
                    isActive
                      ? "bg-gold/10 border-gold/40 text-gold-dim"
                      : "border-line text-soft hover:bg-sand-2"
                  }`}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source : fichier ou lien */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl bg-sand-2 border border-line">
          <button
            type="button"
            onClick={() => setMode("file")}
            disabled={mutation.isPending}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
              mode === "file" ? "bg-white text-gold-dim shadow-sm border border-line" : "text-soft hover:text-ink"
            }`}
          >
            <HardDriveUpload size={14} /> Depuis l'appareil
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            disabled={mutation.isPending}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
              mode === "link" ? "bg-white text-gold-dim shadow-sm border border-line" : "text-soft hover:text-ink"
            }`}
          >
            <Link2 size={14} /> Par lien
          </button>
        </div>

        {mode === "file" ? (
          <div>
            <span className="text-xs font-mono block mb-1.5 text-soft">FICHIER</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={currentType.accept}
              onChange={pickFile}
              disabled={mutation.isPending}
              className="hidden"
              id="media-file-input"
            />
            {!file ? (
              <label
                htmlFor="media-file-input"
                className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-line hover:border-gold/50 hover:bg-sand-2 cursor-pointer transition text-center"
              >
                <currentType.icon size={26} className="text-gold-dim" />
                <span className="text-sm font-medium">Choisir un fichier {currentType.label.toLowerCase()}</span>
                <span className="text-xs text-soft">JPG, PNG, MP3, MP4… · 50 Mo max</span>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-sand-2">
                {preview ? (
                  <img src={preview} alt="" className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-md bg-white border border-line flex items-center justify-center flex-shrink-0">
                    <FileAudio2 size={22} className="text-gold-dim" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-soft font-mono">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  aria-label="Retirer le fichier"
                  className="p-1.5 rounded-full hover:bg-line transition text-soft hover:text-brick"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <Input
            label="URL DU MÉDIA"
            required
            type="url"
            placeholder="https://… ou lien YouTube pour les vidéos"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={mutation.isPending}
          />
        )}

        <Input
          label="MINIATURE (OPTIONNEL)"
          type="url"
          placeholder="https://…/miniature.jpg"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          disabled={mutation.isPending}
        />

        <Textarea
          label="DESCRIPTION (OPTIONNEL)"
          rows={3}
          placeholder="Quelques mots sur ce moment…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={mutation.isPending}
        />

        <div className="flex items-start gap-2 rounded-lg bg-sand-2 border border-line p-3 text-xs text-soft leading-relaxed">
          <Info size={14} className="mt-0.5 flex-shrink-0 text-gold-dim" />
          <span>
            Importez un fichier depuis votre appareil (photo, audio, vidéo — 50 Mo max) ou collez
            un lien (fichier direct ou YouTube). Il sera vérifié par l'équipe dirigeante avant
            d'apparaître dans la galerie — suivez son statut dans « Mes soumissions ».
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={!valid || mutation.isPending}>
          {mutation.isPending ? (
            mode === "file" && file ? (
              "Envoi du fichier…"
            ) : (
              "Envoi en cours…"
            )
          ) : (
            <>
              Publier <Upload size={15} className="ml-2" />
            </>
          )}
        </Button>
      </form>
    </Modal>
  );
}