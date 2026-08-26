"use client";

// Mapa Leaflet de la ficha de barrio: marker principal (verde/dorado) + los
// POIs de Funes con divIcon chico coloreado por categoría (SVG inline).
// Tiles CartoDB Positron, igual que el resto del sitio.

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { POIS_FUNES, POI_CATEGORIA_META, type PoiCategoria } from "@/data/pois-funes";
import { LIGHT_TILES } from '@/lib/map-tiles'

const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

// Paths SVG (lucide, 24x24 stroke) por categoría para el divIcon.
const SVG_PATHS: Record<PoiCategoria, string> = {
  educacion:
    '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  salud: '<path d="M11 2v6H5v8h6v6h2v-6h6V8h-6V2z"/>',
  supermercados:
    '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  farmacias:
    '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  combustible:
    '<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
  gastronomia:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
};

function poiIcon(categoria: PoiCategoria) {
  const { color } = POI_CATEGORIA_META[categoria];
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG_PATHS[categoria]}</svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function barrioIcon(nombre: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:40px;height:40px;border-radius:50%;background:#0F3F26;border:3px solid #B8935A;box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div style="margin-top:3px;background:#0F3F26;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;font-family:${P}">${nombre}</div>
    </div>`,
    iconSize: [40, 58],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

// react-leaflet v4 puede dejar un popup auto-abierto al montar los markers;
// esto arranca el mapa con todos los popups cerrados.
function CerrarPopupInicial() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.closePopup(), 0);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function MapaPoisClient({
  lat,
  lng,
  nombre,
}: {
  lat: number;
  lng: number;
  nombre: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution={LIGHT_TILES.attribution}
        url={LIGHT_TILES.url}
      />
      <CerrarPopupInicial />

      <Marker position={[lat, lng]} icon={barrioIcon(nombre)} zIndexOffset={1000}>
        <Popup>
          <span style={{ fontFamily: P, fontWeight: 600, fontSize: 13 }}>{nombre}</span>
        </Popup>
      </Marker>

      {POIS_FUNES.map((poi) => (
        <Marker key={poi.nombre} position={[poi.lat, poi.lng]} icon={poiIcon(poi.categoria)}>
          <Popup>
            <div style={{ fontFamily: P, fontSize: 12.5 }}>
              <strong>{poi.nombre}</strong>
              <br />
              <span style={{ color: POI_CATEGORIA_META[poi.categoria].color, fontWeight: 600 }}>
                {POI_CATEGORIA_META[poi.categoria].label}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
