# OptiCat Simulation Configuration Guide

This guide provides comprehensive information for configuring OptiCat HVAC simulations.

## Input Parameters

- **HVAC System Components**:
    - `ahu_model`: Model of the Air Handling Unit.
    - `fan_type`: Type of fan (e.g., centrifugal, axial).
    - `coil_efficiency`: Efficiency of heating/cooling coils.
- **Environmental Conditions**:
    - `outdoor_temperature`: Ambient outdoor temperature range.
    - `humidity_levels`: Outdoor humidity levels.
    - `solar_gain`: Solar radiation impact on the building.
- **Operational Schedules**:
    - `occupancy_schedule`: Building occupancy patterns.
    - `setpoint_temperatures`: Desired indoor temperature setpoints.
    - `ventilation_rates`: Air exchange rates.

## System Models

(Details about the internal models used in OptiCat simulations, e.g., thermodynamic models, fluid dynamics.)

## Configuration Examples

```json
{
  "simulation_id": "sim-001",
  "hvac_system": {
    "ahu_model": "AHU-PRO-XL",
    "fan_type": "Centrifugal",
    "coil_efficiency": 0.85
  },
  "environment": {
    "outdoor_temperature": { "min": -10, "max": 30, "unit": "°C" },
    "humidity_levels": { "avg": 60, "unit": "%" }
  },
  "schedule": {
    "occupancy": "office_hours_8_to_17",
    "setpoint_temperatures": { "heating": 21, "cooling": 24, "unit": "°C" }
  }
}
```
