/**
 * A static OpenStreetMap header.
 *
 * The provider map is not a map screen — it never pans, zooms, rotates or
 * pitches. All a map engine was doing behind that 238px header was painting
 * tiles under a pin, so this paints them directly: the slippy-tile grid that
 * covers the view, fetched as plain images, with the pin composited on top in
 * React Native.
 *
 * That buys three things over `react-native-maps`: no Google Maps API key (and
 * so no billing account), no native module (so web renders the real map rather
 * than a stand-in), and no dependency at all — `expo-image` is already here.
 *
 * ## Two obligations that travel with OSM data
 *
 * 1. **Attribution is a licence term, not decoration.** The ODbL requires
 *    "© OpenStreetMap contributors" to be visible wherever the tiles are. It is
 *    rendered below and must not be removed or hidden behind the identity card.
 * 2. **`tile.openstreetmap.org` is a donated service, not a CDN.** Its usage
 *    policy rules out heavy or commercial app traffic. Fine for a prototype at
 *    this volume; before launch point `TILE_URL` at a paid host — MapTiler,
 *    Stadia and Carto all serve the same scheme, so it is a one-line change.
 *    Tiles are cached to disk and the client identifies itself, both of which
 *    that policy asks for.
 */

import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';

import { Txt } from '@/components/Txt';

/** OSM raster tiles are 256px square; the whole scheme is built on that. */
const TILE_SIZE = 256;

/** z16 ≈ 0.006° of latitude across this header — "this building", not "this district". */
const DEFAULT_ZOOM = 16;

/** Web Mercator cannot represent the poles; this is where it is truncated. */
const MAX_LATITUDE = 85.05112878;

const TILE_URL = (z: number, x: number, y: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

/** The OSM tile policy asks every client to identify itself by name. */
const TILE_HEADERS = { 'User-Agent': 'Sahaya/1.0 (com.sahaya.app)' };

interface Tile {
  key: string;
  uri: string;
  left: number;
  top: number;
}

/**
 * Web Mercator, in fractional tile units.
 *
 * Returns where a coordinate falls on the z-level tile grid — `{ x: 2.4, y: 1.7 }`
 * meaning "40% across tile 2, 70% down tile 1" — so the grid can be offset to
 * put the subject dead centre rather than snapped to a tile boundary.
 */
function project(latitude: number, longitude: number, zoom: number) {
  const scale = 2 ** zoom;
  const lat = Math.min(MAX_LATITUDE, Math.max(-MAX_LATITUDE, latitude));
  const latRad = (lat * Math.PI) / 180;

  return {
    x: ((longitude + 180) / 360) * scale,
    y: ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * scale,
  };
}

interface OsmMapProps {
  latitude: number;
  longitude: number;
  height: number;
  zoom?: number;
  /** Composited centred over the tiles — the pin. */
  children?: React.ReactNode;
  accessibilityLabel?: string;
}

export function OsmMap({
  latitude,
  longitude,
  height,
  zoom = DEFAULT_ZOOM,
  children,
  accessibilityLabel,
}: OsmMapProps) {
  const { width } = useWindowDimensions();

  const tiles = useMemo<Tile[]>(() => {
    if (width <= 0 || height <= 0) return [];

    const scale = 2 ** zoom;
    const centre = project(latitude, longitude, zoom);

    // Top-left of the viewport, in world pixels, with the subject centred.
    const originX = centre.x * TILE_SIZE - width / 2;
    const originY = centre.y * TILE_SIZE - height / 2;

    const firstX = Math.floor(originX / TILE_SIZE);
    const lastX = Math.floor((originX + width) / TILE_SIZE);
    const firstY = Math.floor(originY / TILE_SIZE);
    const lastY = Math.floor((originY + height) / TILE_SIZE);

    const grid: Tile[] = [];

    for (let y = firstY; y <= lastY; y += 1) {
      // Above the north edge or below the south edge there is no tile to ask for.
      if (y < 0 || y >= scale) continue;

      for (let x = firstX; x <= lastX; x += 1) {
        // Longitude wraps, so a view straddling the antimeridian is still whole.
        const wrappedX = ((x % scale) + scale) % scale;

        grid.push({
          key: `${x}:${y}`,
          uri: TILE_URL(zoom, wrappedX, y),
          left: x * TILE_SIZE - originX,
          top: y * TILE_SIZE - originY,
        });
      }
    }

    return grid;
  }, [latitude, longitude, zoom, width, height]);

  return (
    <View
      className="absolute inset-0 bg-line"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{ uri: tile.uri, headers: TILE_HEADERS }}
          style={{
            position: 'absolute',
            left: tile.left,
            top: tile.top,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
          // Disk cache keeps a revisited provider from re-fetching the same tiles.
          cachePolicy="disk"
          contentFit="cover"
          // Tiles land at slightly different times; a fade turns that into one settle.
          transition={180}
        />
      ))}

      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        {children}
      </View>

      {/*
        Required by the ODbL. Sits 26px up because the identity card is pulled
        22px over the bottom of this header — any lower and the credit is hidden.
      */}
      <View
        className="absolute bottom-[26px] right-[10px] rounded-tag bg-white/[0.82] px-[5px] py-[1px]"
        pointerEvents="none"
      >
        <Txt variant="metaXs" className="text-muted">
          © OpenStreetMap
        </Txt>
      </View>
    </View>
  );
}
