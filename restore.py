import json
import os

transcript_path = r"C:\Users\Aritra\.gemini\antigravity\brain\60a0b160-1a8a-4405-8ead-480fe0123680\.system_generated\logs\transcript.jsonl"
pages_dir = r"c:\Users\Aritra\OneDrive\Desktop\ksp-sherlock\src\pages"

targets = {
    "SimilarCases.tsx", "FIRSearch.tsx", "CrimeAnalytics.tsx", "Reports.tsx",
    "EarlyWarning.tsx", "CriminalNetwork.tsx", "LiveSurveillance.tsx", 
    "Administration.tsx", "Profile.tsx"
}

file_contents = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        args = call['args']
                        target_file = args.get('TargetFile', '')
                        filename = os.path.basename(target_file.strip('"').replace('\\\\', '\\'))
                        if filename in targets:
                            # We might overwrite with the latest version in the transcript
                            content = args.get('CodeContent', '')
                            # The content in args is a JSON string, wait, json.loads already parsed it!
                            # So args['CodeContent'] is the actual string if it was parsed as dict.
                            file_contents[filename] = content
        except Exception as e:
            pass

for filename, content in file_contents.items():
    out_path = os.path.join(pages_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Restored {filename}")
