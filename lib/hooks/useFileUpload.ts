"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getPresignedUploadUrlAction, type UploadFolder } from "@/app/actions/upload";

export type { UploadFolder };

export interface UseFileUploadOptions {
  folder: UploadFolder;
  onSuccess?: (publicUrl: string, key: string) => void;
  onError?: (message: string) => void;
  maxSizeMB?: number;
}

export interface UseFileUploadReturn {
  upload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useFileUpload({
  folder,
  onSuccess,
  onError,
  maxSizeMB,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Holds the in-flight XHR so we can abort it on unmount or concurrent upload
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Abort any in-flight XHR when the component unmounts (scenario D)
  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      // Abort any previous in-flight upload (scenario C: concurrent uploads)
      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }

      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        // Client-side size check (scenario A: fast feedback before hitting server)
        if (maxSizeMB !== undefined && file.size > maxSizeMB * 1024 * 1024) {
          const msg = `File too large. Maximum size is ${maxSizeMB} MB.`;
          setError(msg);
          onError?.(msg);
          return null;
        }

        // Step 1: get presigned URL from server (scenario F: session expiry handled here)
        const result = await getPresignedUploadUrlAction({
          folder,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        if ("error" in result) {
          setError(result.error);
          onError?.(result.error);
          return null;
        }

        // Step 2: upload file directly to R2 via XHR (for progress events)
        const publicUrl = await new Promise<string | null>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          // Progress tracking (scenario M: won't fire in jsdom, guarded by lengthComputable)
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            xhrRef.current = null;
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(100);
              resolve(result.publicUrl);
            } else if (xhr.status === 403) {
              // Scenario E: presigned URL expired
              const msg = "Upload session expired. Please try again.";
              setError(msg);
              onError?.(msg);
              resolve(null);
            } else {
              // Scenario A: non-2xx from R2
              const msg = "Upload failed. Please try again.";
              setError(msg);
              onError?.(msg);
              resolve(null);
            }
          };

          xhr.onerror = () => {
            xhrRef.current = null;
            // Scenario I: CORS or network failure
            const msg = "Upload failed. Check your connection and try again.";
            setError(msg);
            onError?.(msg);
            resolve(null);
          };

          xhr.onabort = () => {
            xhrRef.current = null;
            resolve(null);
          };

          xhr.open("PUT", result.url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        if (publicUrl === null) return null;

        // Step 3: notify caller — DB write + state update happen in onSuccess
        onSuccess?.(publicUrl, result.key);
        return publicUrl;
      } catch {
        // Scenario F: server action threw (e.g. session expired, network)
        const msg = "Session expired. Please refresh and try again.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onSuccess, onError]
  );

  return { upload, isUploading, progress, error, reset };
}
