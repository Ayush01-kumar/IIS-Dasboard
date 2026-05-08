import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const issIcon = L.divIcon({
  className: 'iss-icon',
  html: '<div style="font-size: 20px;">🛰️</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function ISSMap({ currentIss, issHistory }) {
  const center = currentIss ? [currentIss.lat, currentIss.lon] : [0, 0];
  const polyline = issHistory.map((point) => [point.lat, point.lon]);

  return (
    <MapContainer center={center} zoom={3} scrollWheelZoom className="h-72 w-full md:h-96">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polyline.length > 1 && <Polyline positions={polyline} pathOptions={{ color: '#818cf8' }} />}
      {currentIss && (
        <Marker position={center} icon={issIcon}>
          <Popup>
            ISS at {currentIss.lat.toFixed(3)}, {currentIss.lon.toFixed(3)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
