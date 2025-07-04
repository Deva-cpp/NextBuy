import express from 'express';
import { generateReport, resetMetrics, ingestTestResults } from '../utils/botMetricsMonitor.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
router.use(isAdmin);

/**
 * @route GET /api/admin/bot-metrics
 * @desc Get bot detection metrics
 * @access Admin only
 */
router.get('/bot-metrics', (req, res) => {
  try {
    const report = generateReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating bot metrics report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

/**
 * @route POST /api/admin/bot-metrics/reset
 * @desc Reset bot detection metrics
 * @access Admin only
 */
router.post('/bot-metrics/reset', (req, res) => {
  try {
    resetMetrics();
    res.json({ message: 'Bot metrics reset successfully' });
  } catch (error) {
    console.error('Error resetting bot metrics:', error);
    res.status(500).json({ message: 'Error resetting metrics' });
  }
});

/**
 * @route POST /api/admin/bot-metrics/ingest
 * @desc Ingest test results into bot metrics
 * @access Admin only
 */
router.post('/bot-metrics/ingest', (req, res) => {
  try {
    const testResults = req.body;
    ingestTestResults(testResults);
    res.json({ message: 'Test results ingested successfully' });
  } catch (error) {
    console.error('Error ingesting test results:', error);
    res.status(500).json({ message: 'Error ingesting test results' });
  }
});

/**
 * @route GET /api/admin/bot-dashboard
 * @desc Enhanced HTML dashboard for bot metrics with advanced charts
 * @access Admin only
 */
router.get('/bot-dashboard', (req, res) => {
  try {
    const report = generateReport();
    
    // Generate enhanced HTML for dashboard
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NextBuy Bot Detection Dashboard</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px 30px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #fff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          color: white;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 25px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px 0 rgba(116, 75, 162, 0.4);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(116, 75, 162, 0.6);
        }
        .btn-danger {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          box-shadow: 0 4px 15px 0 rgba(255, 107, 107, 0.4);
        }
        .btn-danger:hover {
          box-shadow: 0 8px 25px 0 rgba(255, 107, 107, 0.6);
        }
        .btn-success {
          background: linear-gradient(45deg, #55a3ff, #003d82);
          box-shadow: 0 4px 15px 0 rgba(85, 163, 255, 0.4);
        }
        .auto-refresh {
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px 0 rgba(31, 38, 135, 0.5);
        }
        .card h2 {
          color: white;
          margin-bottom: 20px;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }
        .stat-value {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 10px 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .stat-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .chart-container {
          height: 400px;
          position: relative;
          margin-top: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
        }
        .table-container {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: white;
        }
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        th {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.9rem;
        }
        tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .loading {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          padding: 20px;
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .alert {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          color: #ffc107;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .severity-high { background: rgba(220, 53, 69, 0.2); border-color: rgba(220, 53, 69, 0.5); color: #dc3545; }
        .severity-medium { background: rgba(255, 193, 7, 0.2); border-color: rgba(255, 193, 7, 0.5); color: #ffc107; }
        .severity-low { background: rgba(40, 167, 69, 0.2); border-color: rgba(40, 167, 69, 0.5); color: #28a745; }
        .metric-trend {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 5px;
        }
        .trend-up { color: #ff6b6b; }
        .trend-down { color: #4ade80; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ NextBuy Bot Detection Dashboard</h1>
          <div class="controls">
            <div class="auto-refresh" onclick="toggleAutoRefresh()" style="cursor: pointer; user-select: none;">
              <div class="status-indicator"></div>
              Auto-refresh: ON
            </div>
            <button class="btn btn-success" onclick="exportData()">📊 Export Data</button>
            <button class="btn" onclick="refreshData()">🔄 Refresh</button>
            <button class="btn btn-danger" onclick="resetData()">🗑️ Reset All</button>
          </div>
        </div>
        
        ${parseFloat(report.botPercentage) > 50 ? 
          '<div class="alert severity-high">⚠️ High bot activity detected! Over 50% of requests are from bots.</div>' : 
          parseFloat(report.botPercentage) > 25 ? 
          '<div class="alert severity-medium">⚠️ Moderate bot activity detected.</div>' : 
          '<div class="alert severity-low">✅ Low bot activity - system operating normally.</div>'
        }
        
        <!-- Key Metrics Overview -->
        <div class="card">
          <h2>📊 Key Metrics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${report.totalRequests.toLocaleString()}</div>
              <div class="stat-label">Total Requests</div>
              <div class="metric-trend">Since ${new Date(Date.now() - parseFloat(report.timeFrame) * 3600000).toLocaleDateString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.detectedBots.toLocaleString()}</div>
              <div class="stat-label">Detected Bots</div>
              <div class="metric-trend ${parseFloat(report.botPercentage) > 25 ? 'trend-up' : 'trend-down'}">📈 ${report.botPercentage}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.legitimateRequests.toLocaleString()}</div>
              <div class="stat-label">Legitimate Requests</div>
              <div class="metric-trend trend-down">📉 ${(100 - parseFloat(report.botPercentage)).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.averageBotsPerHour}</div>
              <div class="stat-label">Bots/Hour</div>
              <div class="metric-trend">⏱️ Current rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.suspiciousPatterns.rapidRequests}</div>
              <div class="stat-label">Rate Limited</div>
              <div class="metric-trend">🚫 Blocked requests</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.suspiciousPatterns.headlessDetections}</div>
              <div class="stat-label">Headless Bots</div>
              <div class="metric-trend">🤖 Automated browsers</div>
            </div>
          </div>
        </div>
        
        <!-- Charts Grid -->
        <div class="grid">
          <!-- Detection Methods Chart -->
          <div class="card">
            <h2>🎯 Detection Methods</h2>
            <div class="chart-container">
              <canvas id="detectionMethodsChart"></canvas>
            </div>
          </div>
          
          <!-- Hourly Distribution Chart -->
          <div class="card">
            <h2>⏰ Hourly Bot Activity</h2>
            <div class="chart-container">
              <canvas id="hourlyChart"></canvas>
            </div>
          </div>
          
          <!-- Geographic Distribution -->
          <div class="card">
            <h2>🌍 Geographic Distribution</h2>
            <div class="chart-container">
              <canvas id="geoChart"></canvas>
            </div>
          </div>
          
          <!-- Suspicious Patterns -->
          <div class="card">
            <h2>⚠️ Threat Patterns</h2>
            <div class="chart-container">
              <canvas id="threatsChart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Detailed Tables -->
        <div class="grid">
          <!-- Top IPs -->
          <div class="card">
            <h2>🌐 Top Bot Source IPs</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Requests</th>
                    <th>Threat Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.topIPs.slice(0, 10).map(([ip, count]) => {
                    const threatLevel = count > 100 ? 'HIGH' : count > 50 ? 'MEDIUM' : 'LOW';
                    const threatClass = threatLevel.toLowerCase();
                    return `
                    <tr>
                      <td>${ip}</td>
                      <td>${count.toLocaleString()}</td>
                      <td><span class="severity-${threatClass}">${threatLevel}</span></td>
                      <td><button class="btn" onclick="blockIP('${ip}')">🚫 Block</button></td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Top User Agents -->
          <div class="card">
            <h2>🤖 Top Bot User Agents</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User Agent</th>
                    <th>Count</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.topUserAgents.slice(0, 10).map(([ua, count]) => {
                    const isHeadless = ua.toLowerCase().includes('headless') || ua.toLowerCase().includes('phantom');
                    const isBot = ua.toLowerCase().includes('bot') || ua.toLowerCase().includes('crawler');
                    const type = isHeadless ? 'Headless' : isBot ? 'Crawler' : 'Unknown';
                    return `
                    <tr>
                      <td title="${ua}">${ua.length > 60 ? ua.substring(0, 60) + '...' : ua}</td>
                      <td>${count.toLocaleString()}</td>
                      <td>${type}</td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Top Targeted Paths -->
          <div class="card">
            <h2>🎯 Most Targeted Endpoints</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Attacks</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.topPaths.slice(0, 10).map(([path, count]) => {
                    const riskLevel = path.includes('admin') || path.includes('auth') ? 'HIGH' : 'MEDIUM';
                    return `
                    <tr>
                      <td>${path}</td>
                      <td>${count.toLocaleString()}</td>
                      <td><span class="severity-${riskLevel.toLowerCase()}">${riskLevel}</span></td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Countries -->
          <div class="card">
            <h2>🗺️ Top Countries</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Requests</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.topCountries.slice(0, 10).map(([country, count]) => {
                    const percentage = ((count / report.detectedBots) * 100).toFixed(1);
                    return `
                    <tr>
                      <td>${country}</td>
                      <td>${count.toLocaleString()}</td>
                      <td>${percentage}%</td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Footer Info -->
        <div class="card">
          <h2>📋 System Information</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'N/A'}</div>
              <div class="stat-label">Last Updated</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.timeFrame}</div>
              <div class="stat-label">Data Time Frame</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">NextBuy v1.0</div>
              <div class="stat-label">System Version</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Active</div>
              <div class="stat-label">Protection Status</div>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        let charts = {};
        const reportData = ${JSON.stringify(report)};
        
        // Chart.js global settings
        Chart.defaults.color = '#fff';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

        function createDetectionMethodsChart(data) {
          const ctx = document.getElementById('detectionMethodsChart').getContext('2d');
          const chartData = {
            labels: Object.keys(data.detectionMethods),
            datasets: [{
              label: 'Detection Count',
              data: Object.values(data.detectionMethods),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)'
              ],
              borderColor: '#fff',
              borderWidth: 1.5,
              hoverOffset: 4
            }]
          };
          charts.detection = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  text: 'Bot Detections by Method',
                  font: { size: 16 }
                }
              }
            }
          });
        }

        function createHourlyChart(data) {
          const ctx = document.getElementById('hourlyChart').getContext('2d');
const labels = data.hourlyDistribution.map(h => (h.hour.toString().padStart(2, '0') + ':00'));
          const chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Detected Bots',
                data: data.hourlyDistribution.map(h => h.bots),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                fill: true,
                tension: 0.4,
              }
            ]
          };
          charts.hourly = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.2)' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }
          });
        }

        function createGeoChart(data) {
          const ctx = document.getElementById('geoChart').getContext('2d');
          const labels = data.topCountries.map(c => c[0]);
          const chartData = {
            labels: labels,
            datasets: [{
              label: 'Requests by Country',
              data: data.topCountries.map(c => c[1]),
              backgroundColor: [
                'rgba(153, 102, 255, 0.6)', 
                'rgba(255, 159, 64, 0.6)', 
                'rgba(75, 192, 192, 0.6)', 
                'rgba(255, 206, 86, 0.6)', 
                'rgba(54, 162, 235, 0.6)'
              ],
              borderColor: '#fff',
              borderWidth: 1
            }]
          };
          charts.geo = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.2)' }
                }
              }
            }
          });
        }
        
        function createThreatsChart(data) {
          const ctx = document.getElementById('threatsChart').getContext('2d');
          const chartData = {
            labels: Object.keys(data.suspiciousPatterns),
            datasets: [{
              label: 'Threat Count',
              data: Object.values(data.suspiciousPatterns),
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)', 
                'rgba(255, 159, 64, 0.7)', 
                'rgba(255, 205, 86, 0.7)', 
                'rgba(75, 192, 192, 0.7)'
              ],
              borderColor: '#fff',
              borderWidth: 1,
              pointRadius: 5
            }]
          };
          charts.threats = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }
          });
        }

        function renderAllCharts(data) {
          try {
            // Destroy existing charts
            Object.values(charts).forEach(chart => {
              if (chart && chart.destroy) {
                chart.destroy();
              }
            });
            charts = {};
            
            // Create new charts
            createDetectionMethodsChart(data);
            createHourlyChart(data);
            createGeoChart(data);
            createThreatsChart(data);
            
            console.log('Charts rendered successfully');
          } catch (error) {
            console.error('Error rendering charts:', error);
          }
        }

        // Global variables
        let autoRefreshInterval = null;
        let isAutoRefreshEnabled = true;
        
        document.addEventListener('DOMContentLoaded', () => {
          renderAllCharts(reportData);
          startAutoRefresh();
        });
        
        function startAutoRefresh() {
          if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
          }
          
          if (isAutoRefreshEnabled) {
            autoRefreshInterval = setInterval(refreshData, 15000); // Auto-refresh every 15 seconds
            console.log('Auto-refresh started');
          }
        }
        
        function toggleAutoRefresh() {
          isAutoRefreshEnabled = !isAutoRefreshEnabled;
          const statusElement = document.querySelector('.auto-refresh');
          
          if (isAutoRefreshEnabled) {
            startAutoRefresh();
            if (statusElement) {
              statusElement.innerHTML = '<div class="status-indicator"></div>Auto-refresh: ON';
            }
          } else {
            if (autoRefreshInterval) {
              clearInterval(autoRefreshInterval);
              autoRefreshInterval = null;
            }
            if (statusElement) {
              statusElement.innerHTML = '<div style="width: 12px; height: 12px; border-radius: 50%; background: #ffc107;"></div>Auto-refresh: OFF';
            }
            console.log('Auto-refresh stopped');
          }
        }

        async function refreshData() {
          try {
            console.log('Refreshing dashboard data...');
            const response = await fetch('/api/admin/bot-metrics', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              credentials: 'same-origin'
            });
            
            if (!response.ok) {
              throw new Error('HTTP error! status: ' + response.status);
            }
            
            const newData = await response.json();
            console.log('New data received:', newData);
            
            // Update global reportData
            window.reportData = newData;
            
            // Update charts
            renderAllCharts(newData);
            
            // Update metrics display
            updateMetrics(newData);
            
            // Update timestamp
            const statusElement = document.querySelector('.auto-refresh');
            if (statusElement) {
              const timestamp = new Date().toLocaleTimeString();
              statusElement.innerHTML = '<div class="status-indicator"></div>Auto-refresh: ON (Last: ' + timestamp + ')';
            }
            
            console.log('Dashboard refreshed successfully');
          } catch (error) {
            console.error('Error refreshing data:', error);
            
            // Show error in UI
            const statusElement = document.querySelector('.auto-refresh');
            if (statusElement) {
              statusElement.innerHTML = '<div style="width: 12px; height: 12px; border-radius: 50%; background: #ff6b6b;"></div>Auto-refresh: ERROR';
            }
            
            // Do not show alert on auto-refresh failures to avoid interrupting user
            console.warn('Auto-refresh failed, will retry on next interval');
          }
        }
        
        function updateMetrics(data) {
          try {
            // Update all stat values in the dashboard
            const statValues = document.querySelectorAll('.stat-value');
            if (statValues.length >= 6) {
              statValues[0].textContent = data.totalRequests.toLocaleString();
              statValues[1].textContent = data.detectedBots.toLocaleString();
              statValues[2].textContent = data.legitimateRequests.toLocaleString();
              statValues[3].textContent = data.averageBotsPerHour;
              statValues[4].textContent = data.suspiciousPatterns.rapidRequests;
              statValues[5].textContent = data.suspiciousPatterns.headlessDetections;
            }
            
            // Update last updated time
            const timeElements = document.querySelectorAll('.stat-value');
            if (timeElements.length > 6 && data.generatedAt) {
              timeElements[6].textContent = new Date(data.generatedAt).toLocaleString();
            }
            
            // Update alert based on bot percentage
            const alertElement = document.querySelector('.alert');
            if (alertElement) {
              const botPercentage = parseFloat(data.botPercentage);
              if (botPercentage > 50) {
                alertElement.className = 'alert severity-high';
                alertElement.innerHTML = '⚠️ High bot activity detected! Over 50% of requests are from bots.';
              } else if (botPercentage > 25) {
                alertElement.className = 'alert severity-medium';
                alertElement.innerHTML = '⚠️ Moderate bot activity detected.';
              } else {
                alertElement.className = 'alert severity-low';
                alertElement.innerHTML = '✅ Low bot activity - system operating normally.';
              }
            }
            
            console.log('Metrics updated successfully');
          } catch (error) {
            console.error('Error updating metrics:', error);
          }
        }

        async function resetData() {
          if (confirm('Are you sure you want to reset all bot metrics data? This cannot be undone.')) {
            try {
              const response = await fetch('/api/admin/bot-metrics/reset', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                credentials: 'same-origin'
              });
              
              if (response.ok) {
                const result = await response.json();
                alert('Data reset successfully. Refreshing page...');
                setTimeout(() => window.location.reload(), 1000);
              } else {
                const errorData = await response.json().catch(() => ({ message: 'Failed to reset data' }));
                throw new Error(errorData.message || 'Failed to reset data');
              }
            } catch (error) {
              console.error('Reset error:', error);
              alert('Error: ' + error.message);
            }
          }
        }
        
        async function exportData() {
          try {
            // Get fresh data for export
            const response = await fetch('/api/admin/bot-metrics', {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              credentials: 'same-origin'
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch data for export');
            }
            
            const data = await response.json();
            
            // Create export data with metadata
            const exportData = {
              exportedAt: new Date().toISOString(),
              exportedBy: 'NextBuy Admin Dashboard',
              version: '1.0.0',
              data: data
            };
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            const dateStr = new Date().toISOString().split('T')[0];
            downloadAnchorNode.setAttribute("download", "bot_metrics_report_" + dateStr + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            console.log('Data exported successfully');
          } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data: ' + error.message);
          }
        }
        
        function blockIP(ip) {
          alert('Blocking IP: ' + ip + ' (This is a demo and does not actually block the IP)');
        }
      </script>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error generating bot dashboard:', error);
    res.status(500).send('Error generating dashboard');
  }
});

export default router;
