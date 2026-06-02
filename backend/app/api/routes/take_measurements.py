'''
Receive body measurements and save them to Supabase. Add any other logic in 
services. Right now, we need to take those measurements and figure out what 
best clothing fits the user. 
'''

from fastapi import APIRouter, HTTPException
from app.db.supabase import create_supabase_client

router = APIRouter()

#Now I'm assuming passing in like a JSON Object with Body Measurements
@router.post("/")
def take_measurements(body_measurements: dict[str, float]):
    if not body_measurements or len(body_measurements) <1:
        raise HTTPException(status_code=400, detail="Empty body measurements list")
    #validate that all values are numbers
    for key, val in body_measurements.items():
        if not isinstance(val, (int, float)):
            raise HTTPException(status_code=400, detail=f"Measurement for {key} must be a number")

    #save body measurements in supabase
    supabase_client = create_supabase_client()
    for key, val in body_measurements.items():
        supabase_client.table("body_measurements").insert({key: key, "measurement":val}).execute()
    
    print("Saved body measurements to Supabase")