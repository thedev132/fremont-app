import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { AppState } from "react-native";
import type { Cache } from "swr";
import useSWR from "swr";
// export default function asyncStorageProvider() {
//   const map = new Map();

//   // Load data from AsyncStorage into the map
//   const loadAppCache = async () => {
//     try {
//       const appCache = await AsyncStorage.getItem("app-cache");
//       if (appCache) {
//         JSON.parse(appCache).forEach(([key, value]) => {
//           map.set(key, value);
//         });
//       }
//     } catch (error) {
//       console.error("Error initializing asyncStorageProvider:", error);
//     }
//   };

//   // Save the map to AsyncStorage
//   const saveAppCache = async () => {
//     try {
//       const appCache = JSON.stringify(Array.from(map.entries()));
//       await AsyncStorage.setItem("app-cache", appCache);
//     } catch (error) {
//       console.error("Error saving asyncStorageProvider cache:", error);
//     }
//   };

//   // Listen for app state changes to save the cache
//   AppState.addEventListener("change", (nextAppState) => {
//     if (nextAppState === "background" || nextAppState === "inactive") {
//       saveAppCache();
//     }
//   });

//   // Immediately load the cache when the provider is initialized
//   loadAppCache();

//   // Return a storage provider compatible with SWR
//   return {
//     get(key) {
//       return map.get(key);
//     },
//     set(key, value) {
//       map.set(key, value);
//     },
//     delete(key) {
//       map.delete(key);
//     },
//   };
// }

export const createCachedFetcher = () => {
  const cachePrefix = "cachedFetcher_";

  const getCachedData = async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      const expiryTime = 24 * 60 * 60 * 1000; // 1 day expiration
      if (Date.now() - timestamp > expiryTime) {
        await AsyncStorage.removeItem(key); // Remove expired data
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  };

  const setCachedData = async (key, data) => {
    try {
      const value = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting cached data:", error);
    }
  };

  return async (url, options = {}) => {
    const cacheKey = `${cachePrefix}${url}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(data);
      await setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching fresh data:", error);
      throw error;
    }
  };
};

interface CacheValue {
  timestamp: number;
  data: any;
}

interface CacheMap {
  [key: string]: CacheValue;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes default cache time
const STORAGE_KEY = "app-cache";

export const asyncStorageProvider = () => {
  let cache = new Map<string, CacheValue>();
  let persistPromise: Promise<void> | null = null;

  // Load initial cache from AsyncStorage
  const loadCache = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const storageCache: CacheMap = JSON.parse(data);
        Object.keys(storageCache).forEach((key) => {
          cache.set(key, storageCache[key]);
        });
      }
    } catch (err) {
      console.error("Error loading cache:", err);
    }
  };

  // Initialize cache
  loadCache();

  // Save cache to AsyncStorage
  const persistCache = async () => {
    if (persistPromise) return persistPromise;

    const cacheObj: CacheMap = {};
    cache.forEach((value, key) => {
      cacheObj[key] = value;
    });

    persistPromise = AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObj))
      .catch((err) => {
        console.error("Error persisting cache:", err);
      })
      .finally(() => {
        persistPromise = null;
      });

    return persistPromise;
  };

  return {
    get: (key: string) => {
      const value = cache.get(key);
      if (value) {
        // Check if cache is expired
        if (Date.now() - value.timestamp > CACHE_TIME) {
          cache.delete(key);
          persistCache();
          return null;
        }
        return value.data;
      }
      return null;
    },
    set: (key: string, value: any) => {
      cache.set(key, {
        timestamp: Date.now(),
        data: value,
      });
      persistCache();
    },
    delete: (key: string) => {
      cache.delete(key);
      persistCache();
    },
    clear: () => {
      cache.clear();
      persistCache();
    },
    keys: () => {
      return Array.from(cache.keys());
    },
  } as unknown as Cache<any>;
};
