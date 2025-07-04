#!/usr/bin/env python3
"""
NextBuy Python + Requests Test Suite
Custom HTTP attack scripts and bot behavior simulation
"""

import requests
import time
import threading
import random
import json
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib3

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class NextBuyTestSuite:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
        
    def log_result(self, test_name, status_code, response_time, success, message=""):
        """Log test results"""
        result = {
            "test": test_name,
            "timestamp": datetime.now().isoformat(),
            "status_code": status_code,
            "response_time": response_time,
            "success": success,
            "message": message
        }
        self.results.append(result)
        print(f"[{test_name}] Status: {status_code} | Time: {response_time:.3f}s | {'✓' if success else '✗'} | {message}")
        
    def test_basic_health_check(self):
        """Test 1: Basic health check"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/health")
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            message = "Health check successful" if success else "Health check failed"
            
            self.log_result("Basic Health Check", response.status_code, response_time, success, message)
            return response
        except requests.exceptions.RequestException as e:
            self.log_result("Basic Health Check", 0, 0, False, str(e))
            return None
    
   
    def test_suspicious_user_agents(self):
        """Test 2: Suspicious user agent detection"""
        suspicious_agents = [
            "curl/7.68.0",
            "wget/1.20.3",
            "python-requests/2.28.1",
            "bot/1.0",
            "crawler/2.0",
            "spider/1.5",
            "scraper",
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        ]
        
        for agent in suspicious_agents:
            try:
                headers = {"User-Agent": agent}
                start_time = time.time()
                response = self.session.get(f"{self.base_url}/", headers=headers)
                response_time = time.time() - start_time
                
                # Bot protection might block these
                success = response.status_code in [200, 403]
                message = f"User-Agent: {agent[:30]}..." if len(agent) > 30 else f"User-Agent: {agent}"
                
                self.log_result("Suspicious User Agent", response.status_code, response_time, success, message)
                
            except requests.exceptions.RequestException as e:
                self.log_result("Suspicious User Agent", 0, 0, False, str(e))
                
            time.sleep(0.5)
    
    def test_sql_injection_attempts(self):
        """Test 3: SQL injection protection"""
        injection_payloads = [
            "1' OR '1'='1",
            "1; DROP TABLE users--",
            "' UNION SELECT * FROM users--",
            "1' AND 1=1--",
            "'; INSERT INTO users VALUES('test','test')--",
            "1' OR 1=1#",
            "admin'--",
            "' OR 'x'='x",
            "1' UNION ALL SELECT NULL,NULL,NULL--"
        ]
        
        for payload in injection_payloads:
            try:
                params = {"id": payload}
                start_time = time.time()
                response = self.session.get(f"{self.base_url}/api/products", params=params)
                response_time = time.time() - start_time
                
                # SQL injection should be blocked (400, 403) or not found (404)
                success = response.status_code in [400, 403, 404]
                message = f"Payload: {payload[:30]}..." if len(payload) > 30 else f"Payload: {payload}"
                
                self.log_result("SQL Injection Test", response.status_code, response_time, success, message)
                
            except requests.exceptions.RequestException as e:
                self.log_result("SQL Injection Test", 0, 0, False, str(e))
                
            time.sleep(0.3)
    
    def test_concurrent_requests(self, num_threads=10, requests_per_thread=5):
        """Test 4: Concurrent request simulation"""
        print(f"\n[Concurrent Test] {num_threads} threads, {requests_per_thread} requests each")
        
        def make_concurrent_request(thread_id):
            results = []
            for i in range(requests_per_thread):
                try:
                    start_time = time.time()
                    response = self.session.get(f"{self.base_url}/health")
                    response_time = time.time() - start_time
                    
                    results.append({
                        "thread_id": thread_id,
                        "request_id": i,
                        "status_code": response.status_code,
                        "response_time": response_time
                    })
                    
                except requests.exceptions.RequestException as e:
                    results.append({
                        "thread_id": thread_id,
                        "request_id": i,
                        "status_code": 0,
                        "response_time": 0,
                        "error": str(e)
                    })
            return results
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(make_concurrent_request, i) for i in range(num_threads)]
            
            for future in as_completed(futures):
                thread_results = future.result()
                for result in thread_results:
                    success = result["status_code"] == 200
                    message = f"Thread {result['thread_id']}, Request {result['request_id']}"
                    self.log_result("Concurrent Request", result["status_code"], result["response_time"], success, message)
    
    def test_post_requests(self):
        """Test 5: POST request variations"""
        post_tests = [
            {
                "name": "Normal JSON POST",
                "url": "/api/bot-protection/test",
                "data": {"test": "data", "timestamp": datetime.now().isoformat()},
                "headers": {"Content-Type": "application/json", "X-NextBuy-Test-Request": "true"}
            },
            {
                "name": "Large JSON POST",
                "url": "/api/bot-protection/test",
                "data": {"test": "x" * 1000, "large_field": "y" * 5000},
                "headers": {"Content-Type": "application/json", "X-NextBuy-Test-Request": "true"}
            },
            {
                "name": "Malformed JSON POST",
                "url": "/api/bot-protection/test",
                "data": '{"invalid": json}',
                "headers": {"Content-Type": "application/json"},
                "raw": True
            }
        ]
        
        for test in post_tests:
            try:
                start_time = time.time()
                
                if test.get("raw"):
                    response = self.session.post(
                        f"{self.base_url}{test['url']}", 
                        data=test["data"],
                        headers=test["headers"]
                    )
                else:
                    response = self.session.post(
                        f"{self.base_url}{test['url']}", 
                        json=test["data"],
                        headers=test["headers"]
                    )
                
                response_time = time.time() - start_time
                success = response.status_code in [200, 400, 404]  # Various acceptable responses
                
                self.log_result("POST Request", response.status_code, response_time, success, test["name"])
                
            except requests.exceptions.RequestException as e:
                self.log_result("POST Request", 0, 0, False, f"{test['name']}: {str(e)}")
                
            time.sleep(0.5)
    
    def test_header_manipulation(self):
        """Test 6: Header manipulation and spoofing"""
        header_tests = [
            {"X-Real-IP": "192.168.1.100"},
            {"X-Forwarded-For": "10.0.0.1, 192.168.1.1"},
            {"X-Forwarded-Host": "malicious.com"},
            {"X-Forwarded-Proto": "https"},
            {"Host": "spoofed-host.com"},
            {"Referer": "http://malicious-site.com"},
            {"Origin": "http://evil.com"},
            {"X-Custom-Header": "injection<script>alert('xss')</script>"}
        ]
        
        for headers in header_tests:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}/", headers=headers)
                response_time = time.time() - start_time
                
                success = response.status_code in [200, 400, 403]
                header_desc = ", ".join([f"{k}: {v}" for k, v in headers.items()])
                
                self.log_result("Header Manipulation", response.status_code, response_time, success, header_desc)
                
            except requests.exceptions.RequestException as e:
                self.log_result("Header Manipulation", 0, 0, False, str(e))
                
            time.sleep(0.3)
    
    def test_session_behavior(self):
        """Test 7: Session and cookie behavior"""
        # Test session persistence
        try:
            # First request to establish session
            start_time = time.time()
            response1 = self.session.get(f"{self.base_url}/", headers={"X-NextBuy-Test-Request": "true"})
            response_time1 = time.time() - start_time
            
            cookies_received = len(response1.cookies)
            
            # Second request with session
            start_time = time.time()
            response2 = self.session.get(f"{self.base_url}/health", headers={"X-NextBuy-Test-Request": "true"})
            response_time2 = time.time() - start_time
            
            success = response1.status_code == 200 and response2.status_code == 200
            message = f"Cookies received: {cookies_received}"
            
            self.log_result("Session Test 1", response1.status_code, response_time1, success, message)
            self.log_result("Session Test 2", response2.status_code, response_time2, success, "Follow-up request")
            
        except requests.exceptions.RequestException as e:
            self.log_result("Session Test", 0, 0, False, str(e))
    
    def generate_report(self):
        """Generate test report and send to server"""
        print("\n" + "="*60)
        print("NEXTBUY PYTHON REQUESTS TEST REPORT")
        print("="*60)
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r["success"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Successful: {successful_tests}")
        print(f"Failed: {total_tests - successful_tests}")
        print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%" if total_tests > 0 else "N/A")
        
        # Status code summary
        status_codes = {}
        for result in self.results:
            code = result["status_code"]
            status_codes[code] = status_codes.get(code, 0) + 1
        
        print(f"\nStatus Code Distribution:")
        for code, count in sorted(status_codes.items()):
            print(f"  {code}: {count}")
        
        # Average response times
        response_times = [r["response_time"] for r in self.results if r["response_time"] > 0]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            max_time = max(response_times)
            min_time = min(response_times)
            print(f"\nResponse Times:")
            print(f"  Average: {avg_time:.3f}s")
            print(f"  Min: {min_time:.3f}s")
            print(f"  Max: {max_time:.3f}s")
        
        # Save detailed results to file
        filename = "bot_metrics.json"
        
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\nDetailed results saved to: {filename}")
        
        # Send results to the server
        try:
            print("\nSending test results to the server...")
            response = self.session.post(
                f"{self.base_url}/api/admin/bot-metrics/ingest",
                json=self.results,
                headers={"Content-Type": "application/json", "X-Admin-API-Key": "nextbuy-admin-key-2024"}
            )
            if response.status_code == 200:
                print("✅ Test results successfully ingested by the server.")
            else:
                print(f"❌ Failed to send test results to the server. Status: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"❌ Error sending test results to the server: {e}")
            
        print("="*60)

def main():
    print("NextBuy Python + Requests Test Suite")
    print("====================================")
    
    # Check if server is running
    test_suite = NextBuyTestSuite()
    
    print("Checking if NextBuy server is running...")
    health_response = test_suite.test_basic_health_check()
    
    if not health_response or health_response.status_code != 200:
        print("❌ NextBuy server is not running or not accessible")
        print("Please start the server with: npm start")
        sys.exit(1)
    
    print("✅ NextBuy server is running\n")
    
    # Run all tests
    print("Starting comprehensive test suite...\n")
    
    print("\n1. Testing suspicious user agents...")
    test_suite.test_suspicious_user_agents()
    
    print("\n2. Testing SQL injection protection...")
    test_suite.test_sql_injection_attempts()
    
    print("\n3. Testing concurrent requests...")
    test_suite.test_concurrent_requests()
    
    print("\n4. Testing POST requests...")
    test_suite.test_post_requests()
    
    print("\n5. Testing header manipulation...")
    test_suite.test_header_manipulation()
    
    print("\n6. Testing session behavior...")
    test_suite.test_session_behavior()
    
    # Generate final report
    test_suite.generate_report()

if __name__ == "__main__":
    main()
