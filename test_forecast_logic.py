import sys
import os
import pandas as pd

# Path normalization to ensure services directory is findable
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-service'))

from services.forecast import ForecastService

def test_forecast_logic():
    # Mock some business data (at least 10 rows)
    data = [
        {"date": f"2024-01-{i+1:02d}", "revenue": 100 + i * 10, "sales": 10, "product": "test"}
        for i in range(12)
    ]
    
    service = ForecastService()
    
    print("Running ForecastService Validation...")
    service.validate_data(data)
    print("[PASS] Validation passed.")

    print("Running Preprocessing...")
    df = service.preprocess(data)
    assert len(df) == 12
    assert "ds" in df.columns
    assert "y" in df.columns
    print("[PASS] Preprocessing successful.")

    # We won't actually fit Prophet here as it requires the library to be compiled/installed.
    # But we've verified the data logic which was the main goal.
    print("Forecast logic verified (Pre-model).")

if __name__ == "__main__":
    try:
        test_forecast_logic()
    except Exception as e:
        print(f"[FAIL] {str(e)}")
        sys.exit(1)
