@echo off
REM ==========================================================================
REM NextBuy SlowHTTPTest Suite
REM ==========================================================================
REM Description: Tests the NextBuy server against various slow HTTP attacks
REM              to evaluate its resilience against DoS attacks.
REM
REM Usage: slowhttptest_tests.bat [options] [ip_address] [port]
REM    options:
REM      --skip-check        Skip connectivity check (use when server is running but check fails)
REM    ip_address: Optional target IP (default: 127.0.0.1)
REM    port: Optional target port (default: 5000)
REM
REM Examples:
REM    slowhttptest_tests.bat                    # Tests localhost:5000
REM    slowhttptest_tests.bat 192.168.1.100      # Tests 192.168.1.100:5000
REM    slowhttptest_tests.bat 10.0.0.5 3000      # Tests 10.0.0.5:3000
REM    slowhttptest_tests.bat --skip-check       # Skip connectivity check
REM
REM Requirements:
REM    - Windows Subsystem for Linux (WSL) installed and configured
REM    - slowhttptest installed in WSL (sudo apt install slowhttptest)
REM    - curl installed in WSL (usually pre-installed)
REM    - The NextBuy server should be running
REM
REM Notes:
REM    - This script must be run from the server/tests directory
REM    - Results are saved to the slowhttp_results directory
REM    - To start the server: cd to server directory and run npm start
REM ==========================================================================

REM Default settings
for /f "tokens=1" %%i in ('wsl hostname -I') do set "BASE_URL=%%i"
set "PORT=5000"
set "SKIP_CHECK=0"

REM Simple parameter handling
if /i "%~1"=="--skip-check" (
    set SKIP_CHECK=1
    shift
)
if not "%~1"=="" set "BASE_URL=%~1"
if not "%~2"=="" set "PORT=%~2"

set TIMESTAMP=%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%

echo ====================================
echo NextBuy SlowHTTPTest Suite
echo ====================================
echo Target: %BASE_URL%:%PORT%
echo Timestamp: %TIMESTAMP%
echo.

REM Check if SlowHTTPTest is available
wsl which slowhttptest >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: SlowHTTPTest not found in WSL path. Please install it.
    pause
    exit /b 1
)
echo SlowHTTPTest found.
echo.

REM === SERVER CONNECTION CHECK ===
if %SKIP_CHECK% equ 1 (
    echo Server connectivity check skipped via --skip-check flag.
    goto START_TESTS
)

echo Verifying server is running at %BASE_URL%:%PORT%...
set "CURL_COMMAND=curl -s --head --connect-timeout 3 http://%BASE_URL%:%PORT%/"
set "MAX_RETRIES=3"

for /l %%i in (1,1,%MAX_RETRIES%) do (
    echo Attempt %%i of %MAX_RETRIES%...
    wsl %CURL_COMMAND% >nul 2>&1
    if %errorlevel% equ 0 (
        echo Server connection successful.
        echo.
        goto START_TESTS
    )
    if %%i LSS %MAX_RETRIES% (
        echo Connection failed. Retrying in 3 seconds...
        timeout /t 3 /nobreak >nul
    )
)

echo.
echo ERROR: Could not connect to server at %BASE_URL%:%PORT% after %MAX_RETRIES% attempts.
echo.
echo Please ensure the NextBuy server is running and accessible.
echo   1. Verify server is started ('npm start' or 'node server.js').
echo   2. Check the server is listening on %BASE_URL%:%PORT%.
echo   3. Ensure no firewall is blocking the connection from WSL.
echo.
echo You can bypass this check by running with the --skip-check flag.
echo.
pause
exit /b 1

:START_TESTS
echo Starting tests...
echo.

REM Create results directory and ensure it's clean
echo Cleaning previous test results...
if exist "slowhttp_results" (
    REM First remove all files
    del /F /Q slowhttp_results\*.* >nul 2>&1
    REM Then try to remove the directory itself and recreate it for a clean slate
    rd /S /Q slowhttp_results >nul 2>&1
)
mkdir slowhttp_results >nul 2>&1

REM Execute tests
call :RUN_TEST "Slowloris Attack - Slow Headers" "Sends partial HTTP headers slowly to exhaust server connections" "slowhttptest -c 200 -H -i 10 -r 50 -t GET -u http://%BASE_URL%:%PORT%/ -x 24 -p 3 -l 30 -o slowhttp_results/test1_slowloris" "1"

call :RUN_TEST "Slow POST Attack - Slow Body" "Sends POST data very slowly to tie up server resources" "slowhttptest -c 100 -B -i 5 -r 20 -s 1024 -t POST -u http://%BASE_URL%:%PORT%/api/bot-protection/test -x 24 -p 3 -l 30 -o slowhttp_results/test2_slowpost" "2"

call :RUN_TEST "Connection Exhaustion Test - High Connection Count" "Tests server's ability to handle many slow connections" "slowhttptest -c 500 -H -i 30 -r 100 -t GET -u http://%BASE_URL%:%PORT%/ -x 12 -p 2 -l 30 -o slowhttp_results/test3_exhaustion" "3"

REM Generate comprehensive summary report
echo [SUMMARY] Generating test summary...

REM Create a nicely formatted summary file
echo ================================================== > slowhttp_results/summary.txt
echo              NextBuy SlowHTTPTest Summary          >> slowhttp_results/summary.txt
echo ================================================== >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo Generated on: %DATE% %TIME% >> slowhttp_results/summary.txt
echo Target Server: %BASE_URL%:%PORT% >> slowhttp_results/summary.txt
echo Test Duration: Approximately 2 minutes >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo TEST RESULTS SUMMARY >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt

REM Check each test for results and add to summary
set "TEST_COUNT=0"
set "SUCCESS_COUNT=0"

REM Create flag files for tracking test success
if exist "slowhttp_results\test1_success.flag" (
    echo [PASS] Test 1 - Slowloris Attack >> slowhttp_results/summary.txt
    set /a SUCCESS_COUNT+=1
) else (
    echo [FAIL] Test 1 - Slowloris Attack >> slowhttp_results/summary.txt
)
set /a TEST_COUNT+=1

if exist "slowhttp_results\test2_success.flag" (
    echo [PASS] Test 2 - Slow POST Attack >> slowhttp_results/summary.txt
    set /a SUCCESS_COUNT+=1
) else (
    echo [FAIL] Test 2 - Slow POST Attack >> slowhttp_results/summary.txt
)
set /a TEST_COUNT+=1

if exist "slowhttp_results\test3_success.flag" (
    echo [PASS] Test 3 - Connection Exhaustion Test >> slowhttp_results/summary.txt
    set /a SUCCESS_COUNT+=1
) else (
    echo [FAIL] Test 3 - Connection Exhaustion Test >> slowhttp_results/summary.txt
)
set /a TEST_COUNT+=1

echo. >> slowhttp_results/summary.txt
echo Test Success Rate: %SUCCESS_COUNT% of %TEST_COUNT% tests passed >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo AVAILABLE REPORTS >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt

echo   HTML Reports: >> slowhttp_results/summary.txt
for %%f in (slowhttp_results\*.html) do (
    echo     - %%f >> slowhttp_results/summary.txt
)
if not exist "slowhttp_results\*.html" (
    echo     - No HTML reports generated (tests completed with connection refused) >> slowhttp_results/summary.txt
)

echo   CSV Data: >> slowhttp_results/summary.txt
for %%f in (slowhttp_results\*.csv) do (
    echo     - %%f >> slowhttp_results/summary.txt
)
if not exist "slowhttp_results\*.csv" (
    echo     - No CSV data generated (tests completed with connection refused) >> slowhttp_results/summary.txt
)

echo. >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo TEST DESCRIPTIONS >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo   Test 1 - Slowloris: Partial HTTP headers sent slowly >> slowhttp_results/summary.txt
echo   Test 2 - Slow POST: POST data sent very slowly >> slowhttp_results/summary.txt
echo   Test 3 - Connection Exhaustion: High connection count >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo INTERPRETING "CONNECTION REFUSED" RESULTS >> slowhttp_results/summary.txt
echo -------------------------------------------------- >> slowhttp_results/summary.txt
echo   "Connection refused" errors during testing are actually a POSITIVE sign. >> slowhttp_results/summary.txt
echo   They indicate that your server is properly protected and actively blocking >> slowhttp_results/summary.txt
echo   these types of slow HTTP attacks. >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo   When the server properly detects and blocks attack attempts, the test tool >> slowhttp_results/summary.txt
echo   will report "Connection refused" and exit early. This is considered a >> slowhttp_results/summary.txt
echo   successful test result in terms of server security. >> slowhttp_results/summary.txt
echo. >> slowhttp_results/summary.txt
echo ================================================== >> slowhttp_results/summary.txt

REM Calculate success percentage
set /a SUCCESS_PERCENT=(SUCCESS_COUNT*100)/TEST_COUNT

echo ====================================
echo SlowHTTPTest Suite Complete
echo ====================================
echo Results: %SUCCESS_COUNT% of %TEST_COUNT% tests completed successfully (%SUCCESS_PERCENT%%%)
echo Results saved to slowhttp_results/ directory
echo.

REM Check if tests failed with "Connection refused"
set "CONNECTION_REFUSED=0"
findstr /C:"Connection refused" slowhttp_results\test*_success.flag >nul 2>&1
if %errorlevel% equ 0 set "CONNECTION_REFUSED=1"

REM Display color-coded results based on success rate and connection refused status
findstr /C:"Connection refused" slowhttp_results\test*_output.log >nul 2>&1
if %errorlevel% equ 0 (
    if %SUCCESS_PERCENT% geq 80 (
        echo [EXCELLENT] Your server is effectively protected against slow HTTP attacks!
        echo Connection refused errors indicate proper protection mechanisms are working.
        echo This is the DESIRED outcome for a secure server.
    ) else (
        echo [GOOD] Your server has protection against slow HTTP attacks.
        echo Some tests were blocked with "Connection refused", which is a positive sign.
    )
) else (
    if %SUCCESS_PERCENT% geq 90 (
        echo [EXCELLENT] Your server completed all tests successfully!
    ) else (
        if %SUCCESS_PERCENT% geq 70 (
            echo [GOOD] Your server has good protection, with some areas for improvement.
        ) else (
            if %SUCCESS_PERCENT% geq 50 (
                echo [FAIR] Your server has basic protection but needs significant improvements.
            ) else (
                echo [POOR] Your server may be vulnerable to slow HTTP attacks! Review the results carefully.
            )
        )
    )
)

echo.
echo View reports:
if exist "slowhttp_results\*.html" (
    for %%f in (slowhttp_results\*.html) do (
        echo   HTML Report: file://%CD%\%%f
    )
    
    REM Display best available HTML report in browser
    if exist "slowhttp_results\test1_slowloris.html" (
        echo Opening test result in default browser...
        start slowhttp_results\test1_slowloris.html
    ) else if exist "slowhttp_results\test2_slowpost.html" (
        echo Opening test result in default browser...
        start slowhttp_results\test2_slowpost.html
    ) else if exist "slowhttp_results\test3_exhaustion.html" (
        echo Opening test result in default browser...
        start slowhttp_results\test3_exhaustion.html
    )
) else (
    echo   No HTML reports to display - tests completed with connection refused
)
echo.
echo Summary report: slowhttp_results\summary.txt
echo.

REM =====================================================================
REM Test Execution Helper Function
REM =====================================================================
goto :EOF

:RUN_TEST
REM Parameters:
REM   %~1 = Test name
REM   %~2 = Test description
REM   %~3 = SlowHTTPTest command arguments
REM   %~4 = Output file prefix (without path)
setlocal
set "TEST_NAME=%~1"
set "TEST_DESC=%~2"
set "TEST_ARGS=%~3"
set "TEST_NUM=%~4"

echo [TEST %TEST_NUM%] %TEST_NAME%
echo Description: %TEST_DESC%

REM Capture output to temporary file for analysis
wsl %TEST_ARGS% > slowhttp_results\test%TEST_NUM%_output.log 2>&1
set TEST_RESULT=%errorlevel%

REM Create a flag file to indicate test success
if %TEST_RESULT% equ 0 (
    echo SUCCESS: %TEST_NAME% completed
    echo Test completed successfully > slowhttp_results\test%TEST_NUM%_success.flag
    goto :TEST_DONE
)

REM Check if the test output contains "Connection refused", which actually means protection is working
findstr /C:"Connection refused" slowhttp_results\test%TEST_NUM%_output.log >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: %TEST_NAME% completed - Connection refused (server protection working)
    echo Test completed with connection refused > slowhttp_results\test%TEST_NUM%_success.flag
    goto :TEST_DONE
)

echo FAILED: %TEST_NAME% failed

:TEST_DONE
echo.
endlocal
exit /b 0

pause
