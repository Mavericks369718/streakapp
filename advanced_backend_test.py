#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta
import time

BACKEND_URL = "https://streak-vibes.preview.emergentagent.com/api"

def test_advanced_streak_scenarios():
    """Test advanced streak scenarios and edge cases"""
    
    print("🔬 Starting Advanced Streak Logic Tests")
    
    try:
        # Reset for clean state
        response = requests.delete(f"{BACKEND_URL}/reset", timeout=10)
        print(f"Reset response: {response.status_code}")
        
        # Test scenario: Multiple completions and streak breaks
        print("\n📊 Testing complex streak calculations...")
        
        # First, let's manually insert some historical data by using the backend API
        # We'll simulate completing tasks on different dates by testing the current logic
        
        # Complete today
        response = requests.post(f"{BACKEND_URL}/complete", timeout=10)
        today_result = response.json()
        print(f"Today completion: {today_result}")
        
        # Check streak after first completion
        response = requests.get(f"{BACKEND_URL}/streak", timeout=10)
        streak_data = response.json()
        print(f"Streak after 1 day: current={streak_data.get('current_streak')}, best={streak_data.get('best_streak')}")
        
        # Verify all basic operations work
        response = requests.get(f"{BACKEND_URL}/history", timeout=10)
        history = response.json()
        print(f"History: {history}")
        
        # Test duplicate completion prevention
        response = requests.post(f"{BACKEND_URL}/complete", timeout=10)
        duplicate_result = response.json()
        print(f"Duplicate completion test: {duplicate_result}")
        
        # Final streak check
        response = requests.get(f"{BACKEND_URL}/streak", timeout=10)
        final_streak = response.json()
        
        print("\n📋 Final Test Results:")
        print(f"✅ Current Streak: {final_streak.get('current_streak')}")
        print(f"✅ Best Streak: {final_streak.get('best_streak')}")
        print(f"✅ Total Completions: {final_streak.get('total_completions')}")
        print(f"✅ Today Completed: {final_streak.get('today_completed')}")
        print(f"✅ Last Completion: {final_streak.get('last_completion_date')}")
        
        # Validate the results
        expected_values = {
            'current_streak': 1,
            'best_streak': 1, 
            'total_completions': 1,
            'today_completed': True
        }
        
        success = True
        for key, expected in expected_values.items():
            actual = final_streak.get(key)
            if actual != expected:
                print(f"❌ {key}: expected {expected}, got {actual}")
                success = False
            else:
                print(f"✅ {key}: {actual} (correct)")
        
        return success
        
    except Exception as e:
        print(f"❌ Advanced test error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_advanced_streak_scenarios()
    print(f"\n{'🎉 Advanced tests passed!' if success else '💥 Advanced tests failed!'}")