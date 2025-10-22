import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import 'leaflet-polylinedecorator';

interface RoutePolylineWithArrowsProps {
  positions: [number, number][];
  color?: string;
  weight?: number;
}

export function RoutePolylineWithArrows({ 
  positions, 
  color = '#10b981', 
  weight = 4 
}: RoutePolylineWithArrowsProps) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length < 2) return;

    // Create polyline
    const polyline = L.polyline(positions, {
      color,
      weight,
      opacity: 0.8
    }).addTo(map);

    // Add arrow decorators
    // @ts-ignore
    const decorator = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: '10%',
          repeat: 100,
          symbol: L.Symbol.arrowHead({
            pixelSize: 12,
            polygon: false,
            pathOptions: {
              stroke: true,
              color,
              weight: 2,
              opacity: 0.9
            }
          })
        }
      ]
    }).addTo(map);

    // Cleanup
    return () => {
      map.removeLayer(polyline);
      map.removeLayer(decorator);
    };
  }, [map, positions, color, weight]);

  return null;
}
