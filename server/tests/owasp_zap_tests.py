#!/usr/bin/env python3
"""
NextBuy OWASP ZAP Test Suite
Penetration testing and bot simulation using ZAP API
"""

import requests
import time
import json
import sys
import argparse
from datetime import datetime

class ZAPTestSuite:
    def __init__(self, zap_proxy="http://127.0.0.1:8080", target_url="http://localhost:5000", zap_api_key=None):
        self.zap_proxy = zap_proxy
        self.target_url = target_url
        self.zap_api_url = f"{zap_proxy}/JSON"
        self.zap_api_key = zap_api_key
        self.session = requests.Session()
        self.session.proxies = {
            'http': zap_proxy,
            'https': zap_proxy
        }
        
        # Disable SSL verification for testing
        self.session.verify = False
        requests.packages.urllib3.disable_warnings()

    def _zap_api_request(self, endpoint, params=None):
        if params is None:
            params = {}
        
        url = f"{self.zap_api_url}/{endpoint}/"
        
        if self.zap_api_key:
            params['apikey'] = self.zap_api_key
            
        return requests.get(url, params=params)
        
    def check_zap_connection(self):
        """Check if ZAP is running and accessible"""
        try:
            response = self._zap_api_request("core/view/version")
            if response.status_code == 200:
                version_data = response.json()
                print(f"✅ Connected to OWASP ZAP version: {version_data.get('version', 'Unknown')}")
                return True
            else:
                print(f"❌ Failed to connect to ZAP: HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Cannot connect to ZAP: {str(e)}")
            print("Please ensure OWASP ZAP is running on http://127.0.0.1:8080")
            return False
    
    def start_new_session(self, session_name="NextBuy_Test"):
        """Start a new ZAP session"""
        try:
            params = {"name": session_name, "overwrite": "true"}
            response = self._zap_api_request("core/action/newSession", params)
            
            if response.status_code == 200:
                print(f"✅ Started new ZAP session: {session_name}")
                return True
            else:
                print(f"⚠️ Failed to start new session: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error starting session: {str(e)}")
            return False
    
    def spider_scan(self):
        """Run spider scan to discover URLs"""
        print("\n🕷️ Starting Spider Scan...")
        
        try:
            # Start spider
            params = {"url": self.target_url, "recurse": "true"}
            response = self._zap_api_request("spider/action/scan", params)
            
            if response.status_code != 200:
                print(f"❌ Failed to start spider: {response.text}")
                return False
            
            scan_id = response.json().get("scan", "0")
            print(f"Spider scan started with ID: {scan_id}")
            
            # Monitor progress
            while True:
                progress_response = self._zap_api_request("spider/view/status", {"scanId": scan_id})
                
                if progress_response.status_code == 200:
                    progress = progress_response.json().get("status", "0")
                    print(f"Spider progress: {progress}%")
                    
                    if int(progress) >= 100:
                        break
                
                time.sleep(2)
            
            # Get results
            results_response = self._zap_api_request("spider/view/results", {"scanId": scan_id})
            
            if results_response.status_code == 200:
                results = results_response.json().get("results", [])
                print(f"✅ Spider scan completed. Found {len(results)} URLs")
                return results
            
        except Exception as e:
            print(f"❌ Spider scan error: {str(e)}")
            return []
    
    def active_scan(self):
        """Run active vulnerability scan"""
        print("\n🔍 Starting Active Scan...")
        
        try:
            # Start active scan
            params = {"url": self.target_url, "recurse": "true"}
            response = self._zap_api_request("ascan/action/scan", params)
            
            if response.status_code != 200:
                print(f"❌ Failed to start active scan: {response.text}")
                return False
            
            scan_id = response.json().get("scan", "0")
            print(f"Active scan started with ID: {scan_id}")
            
            # Monitor progress
            start_time = time.time()
            while True:
                progress_response = self._zap_api_request("ascan/view/status", {"scanId": scan_id})
                
                if progress_response.status_code == 200:
                    progress = progress_response.json().get("status", "0")
                    elapsed = time.time() - start_time
                    print(f"Active scan progress: {progress}% (elapsed: {elapsed:.0f}s)")
                    
                    if int(progress) >= 100:
                        break
                    
                    # Timeout after 10 minutes
                    if elapsed > 600:
                        print("⚠️ Active scan timeout, stopping...")
                        break
                
                time.sleep(5)
            
            print("✅ Active scan completed")
            return True
            
        except Exception as e:
            print(f"❌ Active scan error: {str(e)}")
            return False
    
    def get_alerts(self):
        """Get security alerts from ZAP"""
        try:
            response = self._zap_api_request("core/view/alerts")
            
            if response.status_code == 200:
                alerts = response.json().get("alerts", [])
                return alerts
            else:
                print(f"❌ Failed to get alerts: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting alerts: {str(e)}")
            return []
    
    def manual_security_tests(self):
        """Perform manual security tests through ZAP proxy"""
        print("\n🧪 Running Manual Security Tests through ZAP...")
        
        tests = [
            {
                "name": "SQL Injection Test",
                "method": "GET",
                "url": f"{self.target_url}/api/products",
                "params": {"id": "1' OR '1'='1"}
            },
            {
                "name": "XSS Test",
                "method": "GET", 
                "url": f"{self.target_url}/api/products",
                "params": {"search": "<script>alert('xss')</script>"}
            },
            {
                "name": "Path Traversal Test",
                "method": "GET",
                "url": f"{self.target_url}/api/products",
                "params": {"file": "../../../etc/passwd"}
            },
            {
                "name": "Command Injection Test",
                "method": "GET",
                "url": f"{self.target_url}/api/products", 
                "params": {"cmd": "; ls -la"}
            },
            {
                "name": "Admin Access Test",
                "method": "GET",
                "url": f"{self.target_url}/api/admin/bot-dashboard"
            },
            {
                "name": "Bot Metrics Access Test",
                "method": "GET",
                "url": f"{self.target_url}/api/admin/bot-metrics"
            },
            {
                "name": "Malicious Headers Test",
                "method": "GET",
                "url": f"{self.target_url}/",
                "headers": {
                    "X-Forwarded-Host": "evil.com",
                    "X-Real-IP": "192.168.1.100",
                    "User-Agent": "curl/7.68.0"
                }
            },
            {
                "name": "Large POST Test",
                "method": "POST",
                "url": f"{self.target_url}/api/bot-protection/test",
                "json": {"data": "x" * 10000}
            }
        ]
        
        results = []
        for test in tests:
            try:
                print(f"Running: {test['name']}")
                start_time = time.time()
                
                if test["method"] == "GET":
                    response = self.session.get(
                        test["url"],
                        params=test.get("params", {}),
                        headers=test.get("headers", {})
                    )
                elif test["method"] == "POST":
                    response = self.session.post(
                        test["url"],
                        json=test.get("json", {}),
                        headers=test.get("headers", {})
                    )
                
                response_time = time.time() - start_time
                
                result = {
                    "test": test["name"],
                    "status_code": response.status_code,
                    "response_time": response_time,
                    "url": test["url"]
                }
                results.append(result)
                
                print(f"  Status: {response.status_code} | Time: {response_time:.3f}s")
                
                time.sleep(1)  # Small delay between tests
                
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                results.append({
                    "test": test["name"],
                    "status_code": 0,
                    "error": str(e),
                    "url": test["url"]
                })
        
        return results
    
    def generate_report(self, spider_results, manual_results, alerts):
        """Generate comprehensive test report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"zap_test_report_{timestamp}.json"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "target": self.target_url,
            "zap_proxy": self.zap_proxy,
            "spider_scan": {
                "urls_found": len(spider_results),
                "urls": spider_results
            },
            "manual_tests": manual_results,
            "security_alerts": alerts,
            "summary": {
                "total_alerts": len(alerts),
                "high_risk": len([a for a in alerts if a.get("risk") == "High"]),
                "medium_risk": len([a for a in alerts if a.get("risk") == "Medium"]),
                "low_risk": len([a for a in alerts if a.get("risk") == "Low"]),
                "info": len([a for a in alerts if a.get("risk") == "Informational"])
            }
        }
        
        # Save detailed report
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*60)
        print("OWASP ZAP TEST REPORT")
        print("="*60)
        print(f"Target: {self.target_url}")
        print(f"Timestamp: {report['timestamp']}")
        print(f"\nSpider Scan:")
        print(f"  URLs Found: {len(spider_results)}")
        print(f"\nManual Tests:")
        print(f"  Total Tests: {len(manual_results)}")
        
        status_counts = {}
        for result in manual_results:
            status = result.get("status_code", 0)
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for status, count in sorted(status_counts.items()):
            print(f"  Status {status}: {count}")
        
        print(f"\nSecurity Alerts:")
        print(f"  Total: {len(alerts)}")
        print(f"  High Risk: {report['summary']['high_risk']}")
        print(f"  Medium Risk: {report['summary']['medium_risk']}")
        print(f"  Low Risk: {report['summary']['low_risk']}")
        print(f"  Informational: {report['summary']['info']}")
        
        if alerts:
            print(f"\nTop Security Issues:")
            for alert in alerts[:5]:  # Show top 5
                print(f"  - {alert.get('alert', 'Unknown')} ({alert.get('risk', 'Unknown')} risk)")
        
        print(f"\nDetailed report saved to: {report_file}")
        print("="*60)

def main():
    parser = argparse.ArgumentParser(description="NextBuy OWASP ZAP Test Suite")
    parser.add_argument('--api-key', help='OWASP ZAP API Key')
    parser.add_argument('--zap-proxy', default='http://127.0.0.1:8080', help='ZAP proxy URL')
    parser.add_argument('--target-url', default='http://localhost:5000', help='Target application URL')
    args = parser.parse_args()

    print("NextBuy OWASP ZAP Test Suite")
    print("===========================")
    
    # Initialize ZAP test suite
    zap_tests = ZAPTestSuite(zap_proxy=args.zap_proxy, target_url=args.target_url, zap_api_key=args.api_key)
    
    # Check ZAP connection
    if not zap_tests.check_zap_connection():
        print("\n🔧 To use this test suite:")
        print("1. Download and install OWASP ZAP from https://owasp.org/www-project-zap/")
        print("2. Start ZAP in daemon mode: zap.sh -daemon -port 8080 -config api.key=<YOUR_API_KEY>")
        print("3. Or start ZAP GUI and enable API with a key in Options -> API")
        print(f"4. Ensure ZAP is listening on {args.zap_proxy}")
        print("5. Provide the API key with the --api-key argument when running this script.")
        sys.exit(1)
    
    # Check target server
    try:
        test_response = requests.get(f"{zap_tests.target_url}/health", timeout=5)
        if test_response.status_code != 200:
            print(f"❌ Target server not responding properly: {test_response.status_code}")
            sys.exit(1)
        print(f"✅ Target server is running: {zap_tests.target_url}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach target server: {str(e)}")
        print(f"Please ensure NextBuy server is running on {zap_tests.target_url}")
        sys.exit(1)
    
    # Start new ZAP session
    zap_tests.start_new_session()
    
    # Run manual security tests first
    manual_results = zap_tests.manual_security_tests()
    
    # Run spider scan
    spider_results = zap_tests.spider_scan()
    
    # Run active scan (commented out by default as it can take a long time)
    print("\n⚠️ Skipping active scan (can take 10+ minutes)")
    print("To enable active scan, uncomment the line in the script")
    # zap_tests.active_scan()
    
    # Get security alerts
    print("\n📋 Gathering security alerts...")
    alerts = zap_tests.get_alerts()
    
    # Generate report
    zap_tests.generate_report(spider_results, manual_results, alerts)
    
    print("\n✅ OWASP ZAP testing complete!")

if __name__ == "__main__":
    main()
