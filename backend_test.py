#!/usr/bin/env python3

import requests
import json
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://streak-vibes.preview.emergentagent.com/api"

def print_response(response, test_name):
    """Helper function to print response details"""
    print(f"\n=== {test_name} ===")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text, indent=2)}")
    return response

def test_streak_api():
    """Test all streak tracking endpoints"""
    
    print("🧪 Starting Streak Tracking API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    
    try:
        # Test 1: Reset data first to ensure clean state
        print("\n🔄 Resetting data for clean test environment...")
        response = requests.delete(f"{BACKEND_URL}/reset", timeout=10)
        print_response(response, "Reset Data")
        
        # Test 2: Health check endpoint
        print("\n1️⃣ Testing health check endpoint...")
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        health_response = print_response(response, "Health Check")
        
        if health_response.status_code != 200:
            print("❌ Health check failed!")
            return False
        
        # Test 3: Get initial streak stats (should return zeros)
        print("\n2️⃣ Testing initial streak stats...")
        response = requests.get(f"{BACKEND_URL}/streak", timeout=10)
        initial_streak = print_response(response, "Initial Streak Stats")
        
        if initial_streak.status_code != 200:
            print("❌ Initial streak stats failed!")
            return False
            
        initial_data = initial_streak.json()
        if (initial_data.get('current_streak') != 0 or 
            initial_data.get('best_streak') != 0 or 
            initial_data.get('total_completions') != 0 or 
            initial_data.get('today_completed') != False):
            print("❌ Initial streak data is not zeros as expected!")
            return False
        
        # Test 4: Mark today as complete
        print("\n3️⃣ Testing mark today as complete...")
        response = requests.post(f"{BACKEND_URL}/complete", timeout=10)
        complete_response = print_response(response, "Mark Today Complete")
        
        if complete_response.status_code != 200:
            print("❌ Mark complete failed!")
            return False
            
        complete_data = complete_response.json()
        if not complete_data.get('success') or not complete_data.get('today_completed'):
            print("❌ Mark complete response is incorrect!")
            return False
        
        # Test 5: Verify streak stats updated
        print("\n4️⃣ Testing updated streak stats...")
        response = requests.get(f"{BACKEND_URL}/streak", timeout=10)
        updated_streak = print_response(response, "Updated Streak Stats")
        
        if updated_streak.status_code != 200:
            print("❌ Updated streak stats failed!")
            return False
            
        updated_data = updated_streak.json()
        if (updated_data.get('current_streak') != 1 or 
            updated_data.get('best_streak') != 1 or 
            updated_data.get('total_completions') != 1 or 
            updated_data.get('today_completed') != True):
            print("❌ Updated streak data is incorrect!")
            print(f"Expected: current_streak=1, best_streak=1, total_completions=1, today_completed=True")
            print(f"Got: current_streak={updated_data.get('current_streak')}, best_streak={updated_data.get('best_streak')}, total_completions={updated_data.get('total_completions')}, today_completed={updated_data.get('today_completed')}")
            return False
        
        # Test 6: Get completion history
        print("\n5️⃣ Testing completion history...")
        response = requests.get(f"{BACKEND_URL}/history", timeout=10)
        history_response = print_response(response, "Completion History")
        
        if history_response.status_code != 200:
            print("❌ Completion history failed!")
            return False
            
        history_data = history_response.json()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        if (history_data.get('total') != 1 or 
            not history_data.get('dates') or 
            today not in history_data.get('dates', [])):
            print("❌ History data is incorrect!")
            print(f"Expected today's date ({today}) in history")
            return False
        
        # Test 7: Try marking complete again (should say already completed)
        print("\n6️⃣ Testing duplicate completion...")
        response = requests.post(f"{BACKEND_URL}/complete", timeout=10)
        duplicate_response = print_response(response, "Duplicate Mark Complete")
        
        if duplicate_response.status_code != 200:
            print("❌ Duplicate completion test failed!")
            return False
            
        duplicate_data = duplicate_response.json()
        if (not duplicate_data.get('success') or 
            not duplicate_data.get('today_completed') or
            "already" not in duplicate_data.get('message', '').lower()):
            print("❌ Duplicate completion response is incorrect!")
            return False
        
        print("\n✅ All streak tracking API tests passed!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Network error occurred: {str(e)}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_streak_api()
    if success:
        print("\n🎉 All tests completed successfully!")
    else:
        print("\n💥 Some tests failed!")
    exit(0 if success else 1)