import * as FileSystem from "expo-file-system";
import React from "react";
import { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import {
  AppState,
  AppStateStatus,
  InteractionManager,
  Platform,
} from "react-native";
import "react-native-gesture-handler";
import { SWRConfig } from "swr";


async function fileSystemProvider(cacheData: Map<unknown, unknown> | null) {
  InteractionManager.runAfterInteractions(async () => {
    const cacheDir = FileSystem.cacheDirectory + "fremont-cache/";
    const file = `${cacheDir}cache.json`;

    async function ensureDirExists() {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        console.log("Cache directory doesn't exist, creating…");
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
    }

    const map = cacheData || new Map();

    if (map.size === 0) {
      console.log("⛔ Cache is empty, not saving to disk.");
      return;
    }
    console.log("💾 Saving cache to disk…");
    await ensureDirExists();
    await FileSystem.writeAsStringAsync(
      file,
      JSON.stringify(Array.from(map.entries())),
    );
    console.log(`💾 Saved ${map.size} API routes to cache! `);
  });
}

interface SWRWrapperProps {
  fetcher: (url: string, options: RequestInit) => Promise<unknown>;
  children: ReactNode;
}

export function SWRWrapper({ fetcher, children }: SWRWrapperProps) {
  const cacheData = useRef(new Map());
  const lastSaveTime = useRef(Date.now());
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Effect to handle periodic cache saving
  useEffect(() => {
    const interval = setInterval(() => {
      if (cacheData.current && Date.now() - lastSaveTime.current >= 10000) {
        fileSystemProvider(cacheData.current);
        lastSaveTime.current = Date.now();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Effect to handle app state changes
  useEffect(() => {
    const save = () => {
      if (cacheData.current) {
        fileSystemProvider(cacheData.current);
        lastSaveTime.current = Date.now();
      }
    };

    const subscription = AppState.addEventListener("change", save);

    return () => {
      subscription.remove();
    };
  }, []);

  // Effect to load initial cache
  useEffect(() => {
    (async () => {
      if (cacheLoaded) return;
      const cacheDir = FileSystem.cacheDirectory + "fremont-cache/";
      const file = `${cacheDir}cache.json`;
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (fileInfo.exists) {
        console.log("📂 Cache file exists, restoring cache…");
        const data = await FileSystem.readAsStringAsync(file);
        const entries = JSON.parse(data);
        cacheData.current = new Map(entries);
        console.log(`📂 Restored ${cacheData.current.size} API routes!`);
      } else {
        console.log("📂 Cache file doesn't exist, creating new cache…");
        cacheData.current = new Map();
      }
      if (!cacheLoaded) setCacheLoaded(true);
    })();
  }, [cacheData, cacheLoaded]);

  const contextValue = useMemo(
    () => ({
      provider: () => cacheData.current,
      isVisible: () => true,
      fetcher,
      initFocus(callback: () => void) {
        let appState: AppStateStatus = AppState.currentState as AppStateStatus;

        const onAppStateChange = (nextAppState: string) => {
          if (
            appState.match(/inactive|background/) &&
            nextAppState === "active"
          ) {
            callback();
          }
          appState = nextAppState as AppStateStatus;
        };

        const subscription = AppState.addEventListener(
          "change",
          onAppStateChange,
        );

        return () => {
          subscription.remove();
        };
      },
    }),
    [fetcher],
  );

  return cacheLoaded ? (
    <SWRConfig value={contextValue}>{children}</SWRConfig>
  ) : null;
}