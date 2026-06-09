# OptiCat Simulation Output Formats

This document details the expected output formats from OptiCat HVAC simulations, including data structures and key metrics for analysis.

## Output Data Structures

### Summary Report (`summary.json`)
```json
{
  "simulation_id": "sim-001",
  "status": "Completed",
  "duration_hours": 72,
  "total_energy_consumption_kwh": 1500.5,
  "average_indoor_temperature_c": 22.1,
  "peak_cooling_load_kw": 55.0,
  "peak_heating_load_kw": 40.0,
  "warnings_count": 0,
  "errors_count": 0
}
```

### Time-Series Data (`timeseries_data.csv`)
(CSV format with columns for timestamp, indoor temperature, outdoor temperature, energy consumption, fan speed, etc.)

```csv
Timestamp,Indoor Temp (°C),Outdoor Temp (°C),Energy Consumption (kWh),Fan Speed (RPM)
2026-01-01 00:00:00,21.5,-5.0,15.2,1200
2026-01-01 01:00:00,21.7,-4.8,14.9,1210
...
```

## Key Metrics for Analysis

- **Energy Consumption**: Total, daily average, breakdown by heating/cooling/fan.
- **Temperature Profiles**: Indoor temperature stability, deviation from setpoints.
- **Load Profiles**: Peak heating/cooling loads, load duration.
- **Operational Efficiency**: Coefficient of Performance (COP), Energy Efficiency Ratio (EER).
- **Comfort Metrics**: Predicted Mean Vote (PMV), Predicted Percentage of Dissatisfied (PPD).
