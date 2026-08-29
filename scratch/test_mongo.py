import urllib.request
import json

try:
    req = urllib.request.Request("http-[#0c2356]127.0.0.1:8000/api/v1/mongodb/status".replace("[#0c2356]", "://"))
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print("MongoDB Status:", res)
except Exception as e:
    print("Error querying MongoDB status endpoint:", e)
