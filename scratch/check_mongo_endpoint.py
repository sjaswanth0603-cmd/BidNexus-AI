import urllib.request
import json

req = urllib.request.Request("http://127.0.0.1:8000/api/v1/mongodb/status")
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    print("MongoDB API Endpoint Response:", json.dumps(data, indent=2))
