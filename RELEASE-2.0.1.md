# 2.0.1 public API compatibility

Job estimated_duration is measured in minutes. Responses include estimated_hours and service_address when present. Address selection is checked against the job client and business and saved as a snapshot. Sandbox keys are rejected with 403 until a separate sandbox is available.

Job response types expose duration units and address snapshots.

