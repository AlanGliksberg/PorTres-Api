import { Storage } from "@google-cloud/storage";
import type { Express } from "express";
import { extname } from "path";
import { randomUUID } from "crypto";

const storage = new Storage();

const PLAYER_PHOTOS_BUCKET = process.env.GCP_PLAYER_PHOTOS_BUCKET;

const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_");
};

const getExtension = (file: Express.Multer.File) => {
  const fromName = extname(file.originalname || "").toLowerCase();
  if (fromName) return fromName;

  if (file.mimetype === "image/jpeg") return ".jpg";
  if (file.mimetype === "image/png") return ".png";
  if (file.mimetype === "image/webp") return ".webp";

  return "";
};

const getUserPhotoDir = (userId: number) => `profile-pictures/${userId}${process.env.NODE_ENV === "development" ? "-dev" : ""}`;

const deleteExistingPlayerPhotos = async (bucket: ReturnType<Storage["bucket"]>, userId: number) => {
  const dirName = getUserPhotoDir(userId);
  const prefix = `${dirName}/`;
  const [existingFiles] = await bucket.getFiles({ prefix });
  for (const existingFile of existingFiles) {
    try {
      await existingFile.delete();
    } catch (err) {
      console.warn("deleteExistingPlayerPhotos::error", {
        objectName: existingFile.name,
        error: err
      });
    }
  }
};

export const deletePlayerProfilePhoto = async (userId: number) => {
  if (!PLAYER_PHOTOS_BUCKET) {
    throw new Error("GCP_PLAYER_PHOTOS_BUCKET is not configured");
  }

  const bucket = storage.bucket(PLAYER_PHOTOS_BUCKET);
  await deleteExistingPlayerPhotos(bucket, userId);
};

export const uploadPlayerProfilePhoto = async (file: Express.Multer.File, userId: number) => {
  if (!PLAYER_PHOTOS_BUCKET) {
    throw new Error("GCP_PLAYER_PHOTOS_BUCKET is not configured");
  }

  const bucket = storage.bucket(PLAYER_PHOTOS_BUCKET);
  const uniqueSuffix = randomUUID();
  const pictureName = `profile_photo-${userId}-${uniqueSuffix}`;
  const extension = getExtension(file);
  const safeName = sanitizeName(pictureName);
  const dirName = getUserPhotoDir(userId);
  const objectName = `${dirName}/${safeName}${extension}`;
  const destination = bucket.file(objectName);

  await deleteExistingPlayerPhotos(bucket, userId);

  try {
    await destination.save(file.buffer, {
      resumable: false,
      validation: false,
      contentType: file.mimetype,
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    });
  } catch (err: any) {
    console.error("uploadPlayerProfilePhoto::save-error", {
      message: err?.message,
      errors: err?.errors,
      code: err?.code
    });
    throw err;
  }

  try {
    await destination.makePublic();
  } catch (err) {
    console.warn("Failed to make GCP file public", err);
  }

  const publicUrl = `https://storage.googleapis.com/${PLAYER_PHOTOS_BUCKET}/${objectName}`;
  return publicUrl;
};
