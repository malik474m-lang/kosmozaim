"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface GeoData {
  city: string;
  region: string;
  country: string;
  detected: boolean;
  loading: boolean;
}

const GeoContext = createContext<{
  geo: GeoData;
  setCity: (city: string, region: string) => void;
}>({
  geo: { city: "", region: "", country: "Россия", detected: false, loading: true },
  setCity: () => {},
});

export function useGeo() {
  return useContext(GeoContext);
}

export default function GeoProvider({ children }: { children: ReactNode }) {
  const [geo, setGeo] = useState<GeoData>({
    city: "",
    region: "",
    country: "Россия",
    detected: false,
    loading: true,
  });

  useEffect(() => {
    // Сначала проверяем localStorage
    const savedCity = localStorage.getItem("user_city");
    const savedRegion = localStorage.getItem("user_region");

    if (savedCity && savedRegion) {
      setGeo({
        city: savedCity,
        region: savedRegion,
        country: "Россия",
        detected: true,
        loading: false,
      });
      return;
    }

    // Автодетект через API
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        const newGeo = {
          city: data.city || "Москва",
          region: data.region || "Московская область",
          country: data.country || "Россия",
          detected: data.detected || false,
          loading: false,
        };
        setGeo(newGeo);
        localStorage.setItem("user_city", newGeo.city);
        localStorage.setItem("user_region", newGeo.region);
      })
      .catch(() => {
        setGeo({
          city: "Москва",
          region: "Московская область",
          country: "Россия",
          detected: false,
          loading: false,
        });
      });
  }, []);

  const setCity = (city: string, region: string) => {
    setGeo((prev) => ({ ...prev, city, region, detected: true }));
    localStorage.setItem("user_city", city);
    localStorage.setItem("user_region", region);
  };

  return (
    <GeoContext.Provider value={{ geo, setCity }}>
      {children}
    </GeoContext.Provider>
  );
}
