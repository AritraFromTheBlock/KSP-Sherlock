import pandas as pd
import json
import random

def main():
    # Read datasets
    fact_cases = pd.read_csv('fact_cases.csv')
    case_status = pd.read_csv('dim_case_status.csv')
    crime_major = pd.read_csv('dim_crime_major_head.csv')
    crime_minor = pd.read_csv('dim_crime_minor_head.csv')
    district = pd.read_csv('dim_district.csv')
    
    # Merge datasets to get descriptive names
    df = fact_cases.merge(case_status, on='CaseStatusID', how='left')
    df = df.merge(district, on='DistrictID', how='left')
    # CrimeMinorHeadID + CrimeMajorHeadID merge
    df = df.merge(crime_minor, on=['CrimeMinorHeadID', 'CrimeMajorHeadID'], how='left')
    df = df.merge(crime_major, on='CrimeMajorHeadID', how='left')
    
    def map_status(status_name):
        if pd.isna(status_name): return 'Closed'
        s = str(status_name).lower()
        if 'investigation' in s:
            return 'Active'
        elif 'charge sheeted' in s:
            return 'Pending'
        else:
            return 'Closed'
            
    def map_priority(row):
        high_risk = row.get('HighRisk', 0) == 1
        gravity = row.get('GravityOffenceID', 2)
        if high_risk and gravity == 1:
            return 'Critical'
        elif gravity == 1:
            return 'High'
        elif high_risk:
            return 'Medium'
        else:
            return 'Low'

    officers = [
        'Inspector Sharma', 'ACP Reddy', 'Inspector Gowda', 'Sub-Inspector Patil', 
        'ACP Singh', 'Inspector Rao', 'Sub-Inspector Kumar'
    ]
    
    case_summaries = []
    
    # Sort by date descending
    df['CrimeRegisteredDate'] = pd.to_datetime(df['CrimeRegisteredDate'], errors='coerce')
    df = df.sort_values(by='CrimeRegisteredDate', ascending=False)
    
    # Process each row
    for idx, row in df.iterrows():
        status = map_status(row.get('CaseStatusName'))
        priority = map_priority(row)
        
        crime_sub_head = str(row.get('CrimeSubHead', 'Unknown Crime'))
        dist_name = str(row.get('DistrictName', 'Unknown District'))
        
        title = f"{crime_sub_head} in {dist_name}"
        
        crime_no_str = str(row['CrimeNo'])
        if crime_no_str.endswith('.0'):
            crime_no_str = crime_no_str[:-2]
            
        # Build a descriptive summary based on the available data
        date_str = str(row['CrimeRegisteredDate'].date()) if pd.notna(row['CrimeRegisteredDate']) else 'Unknown Date'
        
        victim_count = row.get('VictimCount', 0)
        accused_count = row.get('AccusedCount', 0)
        
        summary = f"Case registered on {date_str} under {crime_sub_head} ({str(row.get('CrimeHead', 'Unknown'))}). "
        summary += f"Location: {dist_name}. "
        summary += f"Involved {victim_count} victim(s) and {accused_count} accused individual(s). "
        
        if row.get('HasRepeatOffender', 0) == 1:
            summary += "Repeat offender flag detected. "
            
        if row.get('ArrestCount', 0) > 0:
            summary += f"Arrests made: {row['ArrestCount']}. "
            
        case_summary = {
            "id": f"cs-{row['CaseMasterID']}",
            "caseNumber": f"FIR/{crime_no_str}/{row.get('Year', 'XXXX')}",
            "title": title,
            "summary": summary,
            "status": status,
            "assignedTo": random.choice(officers),
            "priority": priority,
            "createdDate": date_str,
            "lastUpdated": date_str
        }
        case_summaries.append(case_summary)

    # Save to JSON
    out_path = 'src/data/caseSummariesData.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(case_summaries, f, indent=2)
        
    print(f"Successfully generated {len(case_summaries)} case summaries at {out_path}")

if __name__ == "__main__":
    main()
