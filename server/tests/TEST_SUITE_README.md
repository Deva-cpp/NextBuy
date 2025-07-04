# NextBuy Security Testing Suite

A comprehensive collection of security testing tools and scripts designed to test NextBuy's bot protection, rate limiting, and security measures.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Testing Tools](#testing-tools)
- [Installation Guide](#installation-guide)
- [Running Tests](#running-tests)
- [Test Results](#test-results)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## 🔍 Overview

This test suite includes 7 different security testing tools to evaluate NextBuy's resilience against various attack vectors:

1. **cURL** - Basic HTTP request automation
2. **Postman** - API request automation with GUI
3. **OWASP ZAP** - Penetration testing and vulnerability scanning
4. **Apache Benchmark (ab)** - Load testing and performance evaluation
5. **SlowHTTPTest** - Slow-rate DoS attack simulation
6. **Python + Requests** - Custom HTTP attack scripts
7. **Locust** - Scalable load testing and bot behavior simulation

## 🛠️ Prerequisites

### System Requirements
- **Operating System**: Windows 10/11 (scripts optimized for Windows)
- **PowerShell**: Version 5.1 or higher
- **Python**: Version 3.7 or higher (for Python-based tools)
- **Node.js**: Required for NextBuy server
- **NextBuy Server**: Must be running on `http://localhost:5000`

### Server Setup
Before running any tests, ensure NextBuy server is running:

```bash
# Navigate to NextBuy server directory
cd C:\Users\Admin\Desktop\GBE\NextBuy\server

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

Verify server is running by visiting: `http://localhost:5000/health`

## 🧰 Testing Tools

### 1. cURL Tests (`curl_tests.bat`)

**Purpose**: Basic HTTP request automation and quick API testing.

**Features**:
- Health check validation
- Rate limiting tests
- Bot detection tests
- SQL injection attempts
- Header manipulation
- Concurrent request simulation

**Tests Included**:
- Basic health check
- Root endpoint access
- Bot dashboard access attempts
- Rate limiting validation (10 rapid requests)
- Suspicious user agent detection
- SQL injection protection
- POST request handling
- Custom header processing
- Concurrent request handling

### 2. Postman Collection (`postman_collection.json`)

**Purpose**: Structured API testing with automated assertions.

**Features**:
- Pre-configured test collection
- Automated response validation
- Performance timing checks
- Status code verification
- JSON response parsing

**Test Scenarios**:
- Health check with timing validation
- Root endpoint with message verification
- Admin endpoint access control
- Rate limiting detection
- Bot detection with various user agents
- SQL injection protection
- POST request validation
- Header manipulation testing

### 3. OWASP ZAP Tests (`owasp_zap_tests.py`)

**Purpose**: Professional penetration testing and vulnerability assessment.

**Features**:
- Automated vulnerability scanning
- Spider crawling for URL discovery
- Active security testing
- Comprehensive security reporting
- Manual security test execution

**Security Tests**:
- SQL injection attempts
- Cross-site scripting (XSS)
- Path traversal attacks
- Command injection
- Admin access enumeration
- Header manipulation
- Large payload handling

**Scan Types**:
- **Spider Scan**: Discovers all accessible URLs
- **Active Scan**: Comprehensive vulnerability testing
- **Manual Tests**: Targeted security assessments

### 4. Apache Benchmark Tests (`apache_benchmark_tests.bat`)

**Purpose**: Load testing and performance evaluation under stress.

**Features**:
- Concurrent connection testing
- Request per second measurement
- Response time analysis
- Failure rate monitoring
- Custom header testing

**Test Scenarios**:
- Basic load test (100 requests, 10 concurrent)
- Stress test (500 requests, 50 concurrent)
- Rate limiting test (1000 requests, 100 concurrent)
- POST request load testing
- Keep-alive connection testing
- Custom headers load testing
- Timeout testing

### 5. SlowHTTPTest (`slowhttptest_tests.bat`)

**Purpose**: Slow-rate DoS attack simulation and connection exhaustion testing.

**Features**:
- Slowloris attacks (slow headers)
- Slow POST attacks (slow body)
- Slow read attacks
- Range header DoS
- Connection exhaustion testing

**Attack Types**:
- **Slowloris**: Partial HTTP headers sent slowly
- **Slow POST**: POST data transmitted very slowly
- **Slow Read**: Response reading at reduced rate
- **Range Header**: Apache Range DoS vulnerability testing
- **Mixed Attacks**: Combined header and body attacks
- **Connection Exhaustion**: High connection count testing

### 6. Python + Requests Tests (`python_requests_tests.py`)

**Purpose**: Custom HTTP attack scripting with detailed analysis.

**Features**:
- Comprehensive test suite
- Detailed logging and reporting
- Concurrent request simulation
- Session behavior testing
- Custom attack pattern creation

**Test Categories**:
- Rate limiting validation
- Suspicious user agent testing
- SQL injection protection
- Concurrent request handling
- POST request variations
- Header manipulation
- Session persistence testing

### 7. Locust Tests (`locust_tests.py`)

**Purpose**: Scalable load testing with realistic user behavior simulation.

**Features**:
- Multiple user behavior patterns
- Real-time web-based monitoring
- Scalable load generation
- Custom attack simulation
- Statistical analysis

**User Types**:
- **BotUser**: Simulates bot-like behavior patterns
- **NormalUser**: Mimics legitimate user behavior
- **RapidFireUser**: Generates rapid-fire requests
- **MixedUser**: Combines normal and suspicious behavior

## 🚀 Installation Guide

### 1. cURL
**Windows 10/11**: Pre-installed
```bash
# Verify installation
curl --version
```

### 2. Postman
**Download**: [Postman Official Website](https://www.postman.com/downloads/)
1. Download and install Postman
2. Import `postman_collection.json`
3. Set base URL to `http://localhost:5000`

### 3. OWASP ZAP
**Download**: [OWASP ZAP](https://owasp.org/www-project-zap/)

**Installation**:
1. Download OWASP ZAP installer
2. Install with default settings
3. Start ZAP in daemon mode:
   ```bash
   zap.sh -daemon -port 8080
   ```
   Or use GUI mode and enable API

**Python Dependencies**:
```bash
pip install requests urllib3
```

### 4. Apache Benchmark
**Download**: [Apache HTTP Server](https://httpd.apache.org/download.cgi)

**Installation**:
1. Download Apache HTTP Server
2. Add `bin` directory to system PATH
3. Verify installation:
   ```bash
   ab -V
   ```

### 5. SlowHTTPTest
**Download**: [SlowHTTPTest GitHub](https://github.com/shekyan/slowhttptest)

**Windows Installation**:
1. Download precompiled binary or compile from source
2. Add to system PATH
3. Verify installation:
   ```bash
   slowhttptest -h
   ```

**Alternative Platforms**:
- Ubuntu/Debian: `sudo apt-get install slowhttptest`
- CentOS/RHEL: `sudo yum install slowhttptest`
- macOS: `brew install slowhttptest`

### 6. Python + Requests
**Python Installation**: [Python Official Website](https://www.python.org/)

**Dependencies**:
```bash
pip install requests urllib3
```

### 7. Locust
**Installation**:
```bash
pip install locust
```

## 🏃 Running Tests

### Before Running Tests
1. **Start NextBuy Server**:
   ```bash
   cd C:\Users\Admin\Desktop\GBE\NextBuy\server
   npm start
   ```

2. **Verify Server Status**:
   Visit `http://localhost:5000/health` - should return `{"status": "OK"}`

### Running Individual Tests

#### 1. cURL Tests
```bash
# Navigate to tests directory
cd C:\Users\Admin\Desktop\GBE\NextBuy\server\tests

# Run cURL tests
curl_tests.bat
```

#### 2. Postman Tests
1. Open Postman
2. Import `postman_collection.json`
3. Set environment variable `baseUrl` to `http://localhost:5000`
4. Run collection

#### 3. OWASP ZAP Tests
```bash
# Ensure ZAP is running on port 8080
# Then run:
python owasp_zap_tests.py
```

#### 4. Apache Benchmark Tests
```bash
apache_benchmark_tests.bat
```

#### 5. SlowHTTPTest
```bash
slowhttptest_tests.bat
```

#### 6. Python + Requests Tests
```bash
python python_requests_tests.py
```

#### 7. Locust Tests
```bash
# Command line mode
python -m locust -f locust_tests.py --host=http://localhost:5000 --users 10 --spawn-rate 1 --run-time 60s

# Web UI mode
locust -f locust_tests.py --host=http://localhost:5000
# Then open http://localhost:8089
```

### Running All Tests
```bash
# Run basic tests
curl_tests.bat
python python_requests_tests.py

# Run load tests
apache_benchmark_tests.bat
locust -f locust_tests.py --host=http://localhost:5000 --users 50 --spawn-rate 2 --run-time 120s

# Run security tests (ensure ZAP is running)
python owasp_zap_tests.py

# Run DoS tests (caution: may impact server)
slowhttptest_tests.bat
```

## 📊 Test Results

### Output Files and Locations

#### cURL Tests
- **Console Output**: Real-time results display
- **Temporary Files**: `response.tmp` (cleaned automatically)

#### Postman Tests
- **GUI Reports**: Available in Postman interface
- **Export Options**: JSON, HTML, CSV formats available

#### OWASP ZAP Tests
- **JSON Report**: `zap_test_report_YYYYMMDD_HHMMSS.json`
- **Console Output**: Summary statistics and alerts
- **ZAP Session**: Saved in ZAP application

#### Apache Benchmark Tests
- **Individual Results**: `test1_results.txt` through `test7_results.txt`
- **TSV Data**: `test1_results.tsv` through `test7_results.tsv`
- **Summary Report**: `ab_test_summary.txt`

#### SlowHTTPTest
- **Results Directory**: `results/slowhttp/`
- **HTML Reports**: Individual test HTML files
- **CSV Data**: Raw test data in CSV format
- **Summary**: `results/slowhttp/summary.txt`

#### Python + Requests Tests
- **JSON Report**: `results/python_requests_test_results_YYYYMMDD_HHMMSS.json`
- **Console Output**: Real-time test results and summary

#### Locust Tests
- **Web Dashboard**: `http://localhost:8089` (when running in web mode)
- **CSV Downloads**: Available through web interface
- **Console Output**: Real-time statistics

### Understanding Results

#### Success Indicators
- **HTTP 200**: Normal successful responses
- **HTTP 403**: Bot detection working (expected for suspicious requests)
- **HTTP 429**: Rate limiting active (expected for rapid requests)
- **HTTP 400**: Input validation working (expected for malicious payloads)

#### Failure Indicators
- **HTTP 500**: Server errors (investigate server logs)
- **Connection Timeouts**: Server overwhelmed or unresponsive
- **HTTP 200 for Malicious Requests**: Security controls may need adjustment

#### Performance Metrics
- **Response Time**: Should be < 200ms for normal requests
- **Throughput**: Requests per second capacity
- **Concurrent Connections**: Maximum supported simultaneous connections
- **Error Rate**: Should be < 1% for legitimate traffic

## 🔧 Troubleshooting

### Common Issues

#### Server Not Responding
```bash
# Check if server is running
curl http://localhost:5000/health

# Restart server if needed
cd server
npm start
```

#### Tool Not Found Errors
- Verify tool installation
- Check PATH environment variable
- Download and install missing tools

#### Permission Errors
- Run Command Prompt as Administrator
- Check Windows Defender/Antivirus settings
- Verify file permissions

#### Python Dependency Issues
```bash
# Install missing packages
pip install requests urllib3 locust

# Upgrade existing packages
pip install --upgrade requests urllib3 locust
```

#### ZAP Connection Issues
- Ensure ZAP is running on port 8080
- Check firewall settings
- Verify ZAP API is enabled

#### High Resource Usage
- Reduce concurrent connections in tests
- Run tests individually rather than simultaneously
- Monitor system resources during testing

### Test-Specific Issues

#### cURL Tests
- **Issue**: SSL certificate errors
- **Solution**: Use `-k` flag for self-signed certificates

#### Apache Benchmark
- **Issue**: "ab: command not found"
- **Solution**: Install Apache HTTP Server and add to PATH

#### SlowHTTPTest
- **Issue**: Tests timeout or fail
- **Solution**: Reduce connection count (-c parameter)

#### Locust Tests
- **Issue**: Import errors
- **Solution**: Ensure Python 3.7+ and install locust

## 🔒 Security Considerations

### Safe Testing Practices

1. **Test Environment Only**: Never run these tests against production systems
2. **Network Isolation**: Use isolated test networks when possible
3. **Resource Monitoring**: Monitor system resources during testing
4. **Backup Data**: Ensure test data is backed up before testing
5. **Documentation**: Document all test results for security analysis

### Expected Security Responses

#### Bot Protection
- Suspicious user agents should be blocked (HTTP 403)
- Rapid requests should trigger rate limiting (HTTP 429)
- SQL injection attempts should be blocked (HTTP 400/403)

#### Rate Limiting
- Should activate after 10-15 requests per minute
- Should return HTTP 429 with appropriate headers
- Should reset after time window expires

#### Input Validation
- Malicious payloads should be sanitized or rejected
- XSS attempts should be blocked
- Path traversal should be prevented

### Performance Baselines

#### Normal Operation
- Response time: < 200ms
- Throughput: > 100 requests/second
- Error rate: < 1%

#### Under Load
- Response time: < 500ms (acceptable degradation)
- Throughput: Should scale with available resources
- Error rate: < 5% (during legitimate high load)

#### Attack Scenarios
- Bot requests: Should be blocked or severely rate limited
- Malicious payloads: Should be rejected immediately
- DoS attacks: Server should remain responsive for legitimate traffic

## 📈 Interpreting Results

### Security Assessment

#### Excellent Security
- All malicious requests blocked (403/400)
- Rate limiting active and effective
- No SQL injection vulnerabilities
- DoS attacks mitigated successfully

#### Good Security
- Most malicious requests blocked
- Rate limiting occasionally triggered
- Minor information disclosure
- Some performance degradation under attack

#### Needs Improvement
- Some malicious requests succeed
- Inconsistent rate limiting
- Potential injection vulnerabilities
- Significant performance impact

#### Poor Security
- Malicious requests frequently succeed
- No effective rate limiting
- Injection vulnerabilities present
- Server fails under basic attacks

### Performance Assessment

#### Response Time Analysis
- **< 100ms**: Excellent
- **100-200ms**: Good
- **200-500ms**: Acceptable
- **> 500ms**: Needs optimization

#### Throughput Analysis
- **> 500 req/s**: Excellent
- **100-500 req/s**: Good
- **50-100 req/s**: Acceptable
- **< 50 req/s**: Needs improvement

## 🆘 Support and Maintenance

### Regular Testing Schedule
- **Daily**: Basic health checks with cURL
- **Weekly**: Full security scan with OWASP ZAP
- **Monthly**: Complete load testing with Locust
- **Quarterly**: Comprehensive security assessment

### Updating Test Suites
- Review and update test payloads regularly
- Add new attack vectors as they emerge
- Update tool versions and dependencies
- Adjust test parameters based on application changes

### Monitoring Integration
- Integrate test results with monitoring systems
- Set up alerts for security test failures
- Track performance trends over time
- Document and analyze any security incidents

---

## 📞 Contact and Support

For issues with this testing suite:
1. Check the troubleshooting section above
2. Review tool-specific documentation
3. Verify NextBuy server configuration
4. Check system requirements and dependencies

**Remember**: These tools are designed for security testing and should only be used on systems you own or have explicit permission to test. Unauthorized testing of systems you don't own is illegal and unethical.
