import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export const useEmotions = (videoRef) => {
  const [emotions, setEmotions] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      // Try local path first with relative link
      const MODEL_URL = './models';
      console.log("Attempting model load from:", MODEL_URL);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("✅ Models loaded successfully from local path");
      } catch (error) {
        console.warn("⚠️ Local model load failed, trying CDN fallback...", error);
        
        // CDN Fallback
        const CDN_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL),
          ]);
          setModelsLoaded(true);
          console.log("✅ Models loaded successfully from CDN");
        } catch (cdnError) {
          console.error("❌ Both local and CDN loads failed.", cdnError);
          alert(`Face-AI Error: Models failed to load.\n\nLocal: ${MODEL_URL}\nCDN: ${CDN_URL}\n\nPlease check your browser's Developer Console (F12) for the specific error.`);
        }
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded && videoRef.current) {
      intervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions();

          if (detections) {
            setEmotions(detections.expressions);
          }
        }
      }, 500);
    }
    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, videoRef]);

  return { emotions, modelsLoaded };
};
