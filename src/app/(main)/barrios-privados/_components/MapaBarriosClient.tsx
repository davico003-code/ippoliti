"use client";

// Mapa Leaflet con 15 markers (todos los barrios del HUB).
// scrollWheelZoom: false para que la rueda haga scroll de página, no zoom.
// fitBounds inicial a los 15 markers.

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { getBarriosHub, TIER_HUB_META } from "@/lib/barrios";
import { LIGHT_TILES } from '@/lib/map-tiles'

const TIER_BG: Record<string, string> = {
  premium: "#0d3d24",
  consolidado: "#1A5C38",
  desarrollo: "#B8935A",
  proximamente: "#0a0a0a",
};

function buildIcon(sigla: string, tier: string) {
  return L.divIcon({
    className: "",
    html: `<div class="si-marker-inner marker-${tier}" style="background:${TIER_BG[tier] ?? "#1A5C38"}">${sigla}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    // setTimeout para que MapContainer termine de medirse antes de fitBounds
    const t = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function MapaBarriosClient() {
  const barrios = useMemo(() => getBarriosHub(), []);
  const points = useMemo<[number, number][]>(
    () => barrios.map((b) => [b.lat, b.lng]),
    [barrios]
  );

  return (
    <>
      <MapContainer
        center={[-32.932, -60.8]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={LIGHT_TILES.url}
          attribution={LIGHT_TILES.attribution}
        />
        <FitBounds points={points} />
        {barrios.map((b) => (
          <Marker
            key={b.slug}
            position={[b.lat, b.lng]}
            icon={buildIcon(b.sigla, b.tier)}
          >
            <Popup maxWidth={260} className="bp-popup">
              <div
                style={{
                  width: 230,
                  fontFamily:
                    "var(--font-raleway), 'Raleway', system-ui, sans-serif",
                  padding: "2px 0",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontFamily:
                      "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "#B8935A",
                    textTransform: "uppercase",
                  }}
                >
                  {TIER_HUB_META[b.tier].label}
                </p>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0a0a0a",
                  }}
                >
                  {b.nombre}
                </h3>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    color: "#444",
                    lineHeight: 1.45,
                    fontFamily:
                      "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                  }}
                >
                  {b.descripcion}
                </p>
                <Link
                  href={`/barrios-privados/${b.slug}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1A5C38",
                    textDecoration: "none",
                  }}
                >
                  Ver ficha del barrio →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .si-marker-inner {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
          font-weight: 700; font-size: 10px;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 2px #fff;
          transition: transform 0.2s;
        }
        .si-marker-inner:hover { transform: scale(1.15); }
        .bp-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
        }
        .bp-popup .leaflet-popup-content { margin: 12px 14px; }
      `}</style>
    </>
  );
}
