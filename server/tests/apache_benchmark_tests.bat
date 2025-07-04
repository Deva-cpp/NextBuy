@echo off
set BASE_URL=http://localhost:5000
echo NextBuy Apache Benchmark Test Suite
if not exist "C:\xampp\apache\bin\ab.exe" (
    echo Apache Benchmark not found at "C:\xampp\apache\bin\ab.exe"
    pause
    exit /b
)

echo.
echo Running tests...
echo.

echo Test 1: Get all products
"C:\xampp\apache\bin\ab.exe" -n 100 -c 10 %BASE_URL%/api/benchmark/
echo.

echo Test 2: Get product with ID 1
"C:\xampp\apache\bin\ab.exe" -n 50 -c 5 %BASE_URL%/api/benchmark/1
echo.

echo Test 3: Search for "headphones"
"C:\xampp\apache\bin\ab.exe" -n 50 -c 5 %BASE_URL%/api/benchmark/search/headphones
echo.

echo All tests completed.
pause
