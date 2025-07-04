#!/usr/bin/env python3
"""
NextBuy Locust Test Suite
Scalable user load and bot behavior simulation
"""

from locust import HttpUser, TaskSet, task, between, events
import random
import json
import time
from datetime import datetime

class BotBehaviorTaskSet(TaskSet):
    """Simulate bot-like behavior patterns"""
    
    def on_start(self):
        """Called when a user starts"""
        self.realistic_user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/107.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        ]
        self.client.headers["User-Agent"] = random.choice(self.realistic_user_agents)
        
    @task(3)
    def health_check(self):
        """Frequent health check requests"""
        self.client.get("/health")
    
    @task(2)
    def root_endpoint(self):
        """Access root endpoint"""
        self.client.get("/")
    
    

class NormalUserTaskSet(TaskSet):
    """Simulate normal user behavior"""

    def on_start(self):
        """Set a realistic user agent for the user."""
        self.realistic_user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/107.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        ]
        self.client.headers["User-Agent"] = random.choice(self.realistic_user_agents)
    
    @task(5)
    def browse_homepage(self):
        """Normal homepage browsing"""
        self.client.get("/")
    
    @task(3)
    def check_health(self):
        """Occasional health checks"""
        self.client.get("/health")
    
    @task(2)
    def browse_products(self):
        """Browse products normally"""
        self.client.get("/api/products")
    
    @task(1)
    def search_products(self):
        """Search for products with normal queries"""
        search_terms = ["laptop", "phone", "book", "shoes", "watch"]
        term = random.choice(search_terms)
        params = {"search": term}
        self.client.get("/api/products", params=params)

class RapidFireTaskSet(TaskSet):
    """Simulate rapid-fire requests (rate limiting test)"""
    
    def on_start(self):
        """Set a realistic user agent for the user."""
        self.realistic_user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/107.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        ]
        self.client.headers["User-Agent"] = random.choice(self.realistic_user_agents)

    @task(1)
    def rapid_requests(self):
        """Make rapid requests to trigger rate limiting"""
        endpoints = ["/health", "/", "/api/products"]
        endpoint = random.choice(endpoints)
        self.client.get(endpoint)

class BotUser(HttpUser):
    """Simulates bot-like behavior"""
    tasks = [BotBehaviorTaskSet]
    wait_time = between(10, 30)  # Increased wait time
    weight = 1

class NormalUser(HttpUser):
    """Simulates normal user behavior"""
    tasks = [NormalUserTaskSet]
    wait_time = between(10, 30)  # Normal human-like wait times
    weight = 15

class RapidFireUser(HttpUser):
    """Simulates rapid-fire attack patterns"""
    tasks = [RapidFireTaskSet]
    wait_time = between(10, 20)  # Increased wait time to avoid immediate rate limiting
    weight = 1

class MixedBehaviorTaskSet(TaskSet):
    """Mix of normal and suspicious behavior"""
    
    def on_start(self):
        """Set a realistic user agent for the user."""
        self.realistic_user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/107.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        ]
        self.client.headers["User-Agent"] = random.choice(self.realistic_user_agents)
        self.request_count = 0
    
    @task(8)
    def normal_behavior(self):
        """Normal requests most of the time"""
        endpoints = ["/", "/health", "/api/products"]
        endpoint = random.choice(endpoints)
        self.client.get(endpoint)
        self.request_count += 1

class MixedUser(HttpUser):
    """User that mostly behaves normally but occasionally does suspicious things"""
    tasks = [MixedBehaviorTaskSet]
    wait_time = between(10, 30)
    weight = 1

# Event handlers for custom logging
@events.request.add_listener
def log_request(request_type, name, response_time, response_length, response, context, exception, **kwargs):
    """Log requests with additional context"""
    if hasattr(response, 'status_code'):
        status_code = response.status_code
        
        # Log rate limiting
        if status_code == 429:
            print(f"⚠️  Rate Limited: {request_type} {name}")
        
        # Log bot detection
        elif status_code == 403:
            print(f"🚫 Bot Detected: {request_type} {name}")
        
        # Log errors
        elif status_code >= 500:
            print(f"❌ Server Error: {request_type} {name} - {status_code}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Called when test starts"""
    print("🚀 NextBuy Locust Load Test Starting...")
    print(f"Target: {environment.host}")
    print("=" * 50)

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Called when test stops"""
    print("\n" + "=" * 50)
    print("📊 NextBuy Locust Load Test Complete")
    
    # Get stats
    stats = environment.stats
    
    print(f"Total Requests: {stats.total.num_requests}")
    print(f"Failed Requests: {stats.total.num_failures}")
    print(f"Average Response Time: {stats.total.avg_response_time:.2f}ms")
    print(f"Max Response Time: {stats.total.max_response_time:.2f}ms")
    print(f"Requests/sec: {stats.total.current_rps:.2f}")
    
    # Show top failures
    if stats.total.num_failures > 0:
        print("\nTop Failures:")
        for failure in stats.errors.values():
            print(f"  {failure.method} {failure.name}: {failure.occurrences} times")

if __name__ == "__main__":
    # This allows running the file directly for testing
    print("NextBuy Locust Test Suite")
    print("========================")
    print("To run this test suite:")
    print("1. Install locust: pip install locust")
    print("2. Run: locust -f locust_tests.py --host=http://localhost:5000")
    print("3. Open web UI: http://localhost:8089")
    print("\nTest Scenarios Available:")
    print("- BotUser: Simulates bot-like behavior patterns")
    print("- NormalUser: Simulates normal user behavior")
    print("- RapidFireUser: Simulates rapid-fire attack patterns")
    print("- MixedUser: Mix of normal and suspicious behavior")
    print("\nRecommended test parameters:")
    print("- Users: 10-50")
    print("- Spawn rate: 1-5 users/second")
    print("- Duration: 2-10 minutes")
