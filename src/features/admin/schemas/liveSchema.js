import { z } from "zod";
import { LIVE_TYPES } from "../../../lib/constants";

export const liveSchema = z
  .object({
    title: z.string().min(3, "Titre requis (min 3 caractères)"),
    type: z.enum(LIVE_TYPES),
    youtubeVideoId: z.string().optional(),
    streamUrl: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "YOUTUBE" && !values.youtubeVideoId?.trim()) {
      ctx.addIssue({ path: ["youtubeVideoId"], message: "ID de la vidéo YouTube requis" });
    }
    if (values.type === "INTERNE" && !values.streamUrl?.trim()) {
      ctx.addIssue({ path: ["streamUrl"], message: "URL du flux requise" });
    }
  });

export const liveDefaultValues = {
  title: "",
  type: "YOUTUBE",
  youtubeVideoId: "",
  streamUrl: "",
};