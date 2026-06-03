import { RefObject, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

type EmotionMap = Record<string, number>;

export const useEmotions = (videoRef: RefObject<HTMLVideoElement>) => {
  const [emotions, setEmotions] = useState<EmotionMap | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      const modelUrl = "/models";

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
        ]);

        if (isMounted) {
          setModelsLoaded(true);
          setModelError(null);
        }
      } catch (error) {
        console.error("Face model loading failed", error);

        if (isMounted) {
          setModelError("Vision models could not be loaded from public assets.");
        }
      }
    };

    loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!modelsLoaded) {
      return undefined;
    }

    intervalRef.current = window.setInterval(async () => {
      const video = videoRef.current;

      if (!video || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections?.expressions) {
          setEmotions({ ...(detections.expressions as unknown as EmotionMap) });
        }
      } catch (error) {
        console.error("Emotion detection failed", error);
      }
    }, 650);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [modelsLoaded, videoRef]);

  return { emotions, modelsLoaded, modelError };
};
