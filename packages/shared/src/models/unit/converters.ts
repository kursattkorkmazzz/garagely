import { DistanceUnit, DISTANCE_TO_METERS } from "./distance";
import { VolumeUnit, VOLUME_TO_LITERS } from "./volume";

/**
 * UnitConverter - Static methods for unit conversions
 *
 * Backend stores values in SI units (meters, liters).
 * Frontend converts to user's preferred display unit.
 */
export class UnitConverter {
  // ============ Distance Conversions ============

  /**
   * Convert from user's preferred unit to meters (for storage)
   */
  static toMeters(value: number, fromUnit: DistanceUnit): number {
    return value * DISTANCE_TO_METERS[fromUnit];
  }

  /**
   * Convert from meters to user's preferred unit (for display)
   */
  static fromMeters(meters: number, toUnit: DistanceUnit): number {
    return meters / DISTANCE_TO_METERS[toUnit];
  }

  /**
   * Convert between any two distance units
   */
  static convertDistance(
    value: number,
    fromUnit: DistanceUnit,
    toUnit: DistanceUnit,
  ): number {
    if (fromUnit === toUnit) return value;
    const meters = UnitConverter.toMeters(value, fromUnit);
    return UnitConverter.fromMeters(meters, toUnit);
  }

  // ============ Volume Conversions ============

  /**
   * Convert from user's preferred unit to liters (for storage)
   */
  static toLiters(value: number, fromUnit: VolumeUnit): number {
    return value * VOLUME_TO_LITERS[fromUnit];
  }

  /**
   * Convert from liters to user's preferred unit (for display)
   */
  static fromLiters(liters: number, toUnit: VolumeUnit): number {
    return liters / VOLUME_TO_LITERS[toUnit];
  }

  /**
   * Convert between any two volume units
   */
  static convertVolume(
    value: number,
    fromUnit: VolumeUnit,
    toUnit: VolumeUnit,
  ): number {
    if (fromUnit === toUnit) return value;
    const liters = UnitConverter.toLiters(value, fromUnit);
    return UnitConverter.fromLiters(liters, toUnit);
  }

  // ============ Formatting ============

  /**
   * Format a distance value with unit suffix
   */
  static formatDistance(
    value: number,
    unit: DistanceUnit,
    decimals: number = 1,
  ): string {
    return `${value.toFixed(decimals)} ${unit}`;
  }

  /**
   * Format a volume value with unit suffix
   */
  static formatVolume(
    value: number,
    unit: VolumeUnit,
    decimals: number = 2,
  ): string {
    return `${value.toFixed(decimals)} ${unit}`;
  }
}
