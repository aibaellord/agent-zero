/**
 * BAEL Geo Utilities - Geolocation & Maps Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete geolocation system:
 * - Current position
 * - Position watching
 * - Distance calculation
 * - Address geocoding
 * - Map utilities
 */

(function () {
  "use strict";

  class BaelGeo {
    constructor() {
      this.watchIds = new Map();
      this.lastPosition = null;
      this.cache = new Map();
      console.log("📍 Bael Geo initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // GEOLOCATION API
    // ═══════════════════════════════════════════════════════════

    // Check if geolocation is available
    isAvailable() {
      return "geolocation" in navigator;
    }

    // Get current position
    getCurrentPosition(options = {}) {
      return new Promise((resolve, reject) => {
        if (!this.isAvailable()) {
          reject(new Error("Geolocation not available"));
          return;
        }

        const geoOptions = {
          enableHighAccuracy: options.highAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const result = this.formatPosition(position);
            this.lastPosition = result;
            resolve(result);
          },
          (error) => {
            reject(this.formatError(error));
          },
          geoOptions,
        );
      });
    }

    // Watch position
    watchPosition(callback, options = {}) {
      if (!this.isAvailable()) {
        throw new Error("Geolocation not available");
      }

      const geoOptions = {
        enableHighAccuracy: options.highAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const result = this.formatPosition(position);
          this.lastPosition = result;
          callback(result);
        },
        (error) => {
          if (options.onError) {
            options.onError(this.formatError(error));
          }
        },
        geoOptions,
      );

      const id = `watch-${Date.now()}`;
      this.watchIds.set(id, watchId);

      return {
        id,
        stop: () => this.clearWatch(id),
      };
    }

    // Clear watch
    clearWatch(id) {
      const watchId = this.watchIds.get(id);
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
        this.watchIds.delete(id);
      }
    }

    // Clear all watches
    clearAllWatches() {
      for (const [id] of this.watchIds) {
        this.clearWatch(id);
      }
    }

    // Format position
    formatPosition(position) {
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
    }

    // Format error
    formatError(error) {
      const messages = {
        1: "Permission denied",
        2: "Position unavailable",
        3: "Timeout",
      };
      return {
        code: error.code,
        message: messages[error.code] || "Unknown error",
      };
    }

    // ═══════════════════════════════════════════════════════════
    // DISTANCE CALCULATIONS
    // ═══════════════════════════════════════════════════════════

    // Calculate distance between two points (Haversine formula)
    distance(lat1, lon1, lat2, lon2, unit = "km") {
      const R = unit === "mi" ? 3958.8 : 6371; // Earth's radius

      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) *
          Math.cos(this.toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    // Distance from coordinates objects
    distanceBetween(point1, point2, unit = "km") {
      return this.distance(
        point1.lat || point1.latitude,
        point1.lng || point1.longitude,
        point2.lat || point2.latitude,
        point2.lng || point2.longitude,
        unit,
      );
    }

    // Distance from current position
    async distanceFromCurrent(point, unit = "km") {
      const current = await this.getCurrentPosition();
      return this.distanceBetween(current.coords, point, unit);
    }

    // Convert degrees to radians
    toRad(deg) {
      return deg * (Math.PI / 180);
    }

    // Convert radians to degrees
    toDeg(rad) {
      return rad * (180 / Math.PI);
    }

    // ═══════════════════════════════════════════════════════════
    // BEARING & DIRECTION
    // ═══════════════════════════════════════════════════════════

    // Calculate bearing between two points
    bearing(lat1, lon1, lat2, lon2) {
      const dLon = this.toRad(lon2 - lon1);
      const lat1Rad = this.toRad(lat1);
      const lat2Rad = this.toRad(lat2);

      const y = Math.sin(dLon) * Math.cos(lat2Rad);
      const x =
        Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

      const bearing = this.toDeg(Math.atan2(y, x));
      return (bearing + 360) % 360;
    }

    // Get compass direction
    compassDirection(bearing) {
      const directions = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
      ];
      const index = Math.round(bearing / 22.5) % 16;
      return directions[index];
    }

    // ═══════════════════════════════════════════════════════════
    // POINT IN AREA
    // ═══════════════════════════════════════════════════════════

    // Check if point is in circle
    isInRadius(point, center, radius, unit = "km") {
      const distance = this.distanceBetween(point, center, unit);
      return distance <= radius;
    }

    // Check if point is in bounding box
    isInBounds(point, bounds) {
      const lat = point.lat || point.latitude;
      const lng = point.lng || point.longitude;

      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    }

    // Check if point is in polygon
    isInPolygon(point, polygon) {
      const x = point.lng || point.longitude;
      const y = point.lat || point.latitude;

      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng || polygon[i].longitude;
        const yi = polygon[i].lat || polygon[i].latitude;
        const xj = polygon[j].lng || polygon[j].longitude;
        const yj = polygon[j].lat || polygon[j].latitude;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
      }

      return inside;
    }

    // ═══════════════════════════════════════════════════════════
    // BOUNDING BOX
    // ═══════════════════════════════════════════════════════════

    // Create bounding box from points
    createBounds(points) {
      let north = -90,
        south = 90,
        east = -180,
        west = 180;

      for (const point of points) {
        const lat = point.lat || point.latitude;
        const lng = point.lng || point.longitude;

        if (lat > north) north = lat;
        if (lat < south) south = lat;
        if (lng > east) east = lng;
        if (lng < west) west = lng;
      }

      return { north, south, east, west };
    }

    // Get center of bounds
    getBoundsCenter(bounds) {
      return {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
    }

    // Extend bounds to include point
    extendBounds(bounds, point) {
      const lat = point.lat || point.latitude;
      const lng = point.lng || point.longitude;

      return {
        north: Math.max(bounds.north, lat),
        south: Math.min(bounds.south, lat),
        east: Math.max(bounds.east, lng),
        west: Math.min(bounds.west, lng),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // FORMATTING
    // ═══════════════════════════════════════════════════════════

    // Format coordinates as DMS
    toDMS(lat, lng) {
      const formatDMS = (decimal, isLat) => {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesFloat = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesFloat);
        const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

        const direction =
          decimal >= 0 ? (isLat ? "N" : "E") : isLat ? "S" : "W";

        return `${degrees}°${minutes}'${seconds}"${direction}`;
      };

      return {
        latitude: formatDMS(lat, true),
        longitude: formatDMS(lng, false),
        toString: () => `${formatDMS(lat, true)} ${formatDMS(lng, false)}`,
      };
    }

    // Format distance
    formatDistance(distance, unit = "km") {
      if (unit === "mi") {
        if (distance < 0.1) {
          return `${Math.round(distance * 5280)} ft`;
        }
        return `${distance.toFixed(1)} mi`;
      }

      if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
      }
      return `${distance.toFixed(1)} km`;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Calculate midpoint
    midpoint(lat1, lon1, lat2, lon2) {
      const lat1Rad = this.toRad(lat1);
      const lon1Rad = this.toRad(lon1);
      const lat2Rad = this.toRad(lat2);
      const dLon = this.toRad(lon2 - lon1);

      const Bx = Math.cos(lat2Rad) * Math.cos(dLon);
      const By = Math.cos(lat2Rad) * Math.sin(dLon);

      const lat3 = Math.atan2(
        Math.sin(lat1Rad) + Math.sin(lat2Rad),
        Math.sqrt(
          (Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By,
        ),
      );
      const lon3 = lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);

      return {
        lat: this.toDeg(lat3),
        lng: this.toDeg(lon3),
      };
    }

    // Calculate destination point
    destination(lat, lon, distance, bearing, unit = "km") {
      const R = unit === "mi" ? 3958.8 : 6371;
      const d = distance / R;
      const brng = this.toRad(bearing);
      const lat1 = this.toRad(lat);
      const lon1 = this.toRad(lon);

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(d) +
          Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
      );

      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
          Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
        );

      return {
        lat: this.toDeg(lat2),
        lng: this.toDeg(lon2),
      };
    }

    // Sort points by distance from reference
    sortByDistance(points, reference) {
      return [...points].sort((a, b) => {
        const distA = this.distanceBetween(a, reference);
        const distB = this.distanceBetween(b, reference);
        return distA - distB;
      });
    }

    // Find nearest point
    findNearest(points, reference) {
      const sorted = this.sortByDistance(points, reference);
      return sorted[0] || null;
    }

    // Create Google Maps URL
    googleMapsUrl(lat, lng, options = {}) {
      const { zoom = 15, label } = options;
      const base = "https://www.google.com/maps";

      if (label) {
        return `${base}/search/?api=1&query=${encodeURIComponent(label)}&query_place_id=${lat},${lng}`;
      }
      return `${base}/@${lat},${lng},${zoom}z`;
    }

    // Create Apple Maps URL
    appleMapsUrl(lat, lng, options = {}) {
      const { label, zoom = 15 } = options;
      let url = `https://maps.apple.com/?ll=${lat},${lng}&z=${zoom}`;
      if (label) url += `&q=${encodeURIComponent(label)}`;
      return url;
    }

    // Get last known position
    getLastPosition() {
      return this.lastPosition;
    }
  }

  // Initialize
  window.BaelGeo = new BaelGeo();

  // Global shortcuts
  window.$geo = window.BaelGeo;
  window.$getLocation = () => window.BaelGeo.getCurrentPosition();
  window.$distance = (p1, p2, unit) =>
    window.BaelGeo.distanceBetween(p1, p2, unit);
})();
