"use client";

import { useEffect } from "react";

export default function GeoRedirectChecker() {
  useEffect(() => {
    const dismissed = sessionStorage.getItem("geo_redirect_dismissed");
    if (dismissed) return;

    fetch("/api/geo-redirect")
      .then((res) => res.json())
      .then((data) => {
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
