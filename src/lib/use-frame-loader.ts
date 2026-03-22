"use client";

import { useState, useEffect, useRef } from "react";

interface FrameLoaderState {
  frameImage: HTMLImageElement | null;
  loading: boolean;
  error: string | null;
}

export function useFrameLoader(frameSrc: string): FrameLoaderState {
  const [state, setState] = useState<FrameLoaderState>({
    frameImage: null,
    loading: true,
    error: null,
  });
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const cached = cacheRef.current.get(frameSrc);
    if (cached) {
      setState({ frameImage: cached, loading: false, error: null });
      return;
    }

    setState({ frameImage: null, loading: true, error: null });

    const img = new Image();
    img.onload = () => {
      cacheRef.current.set(frameSrc, img);
      setState({ frameImage: img, loading: false, error: null });
    };
    img.onerror = () => {
      setState({
        frameImage: null,
        loading: false,
        error: `Failed to load frame: ${frameSrc}`,
      });
    };
    img.src = frameSrc;
  }, [frameSrc]);

  return state;
}
