"""
Simple Mock API Server for AI ROI Calculator
Minimal dependencies version
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import logging

# Suppress default HTTP logging
logging.getLogger('http.server').setLevel(logging.WARNING)

class MockAPIHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default request logging
        pass
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers()
            response = {'status': 'healthy'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        if self.path == '/api/calculate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            input_data = json.loads(post_data.decode())
            
            # ROI 계산
            result = calculate_roi(input_data)
            
            self._set_headers()
            self.wfile.write(json.dumps(result).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def calculate_roi(data):
    """ROI 계산 로직"""
    # Constants
    AVG_HOURS_PER_WEEK = 54
    WORK_WEEKS_PER_YEAR = 39
    REPLACEMENT_COST = 20000
    ASSESSMENT_HOURS_PER_WEEK = 15
    
    # Extract inputs
    school_size = data.get('school_size', 50)
    avg_salary = data.get('avg_salary', 48892)
    attrition_rate = data.get('attrition_rate', 8.8)
    avg_sick_days = data.get('avg_sick_days', 7)
    supply_rate = data.get('supply_rate', 180)
    ai_cost_per_teacher = data.get('ai_cost_per_teacher', 100)
    workload_level = data.get('workload_level', 70)
    training_cost = data.get('training_cost', 2000)
    setup_cost = data.get('setup_cost', 1500)
    absenteeism_reduction = data.get('absenteeism_reduction', 20)
    retention_improvement = data.get('retention_improvement', 5)
    time_horizon = data.get('time_horizon', 5)
    
    # Calculate
    annual_ai_cost = school_size * ai_cost_per_teacher
    initial_cost = setup_cost + training_cost
    
    # Supply Teacher Savings
    current_absent_days = school_size * avg_sick_days
    reduced_absent_days = current_absent_days * (absenteeism_reduction / 100)
    supply_teacher_savings = reduced_absent_days * supply_rate
    
    # Retention Savings
    current_leavers = school_size * (attrition_rate / 100)
    new_attrition_rate = max(0, attrition_rate - retention_improvement)
    new_leavers = school_size * (new_attrition_rate / 100)
    teachers_retained = current_leavers - new_leavers
    retention_savings = teachers_retained * REPLACEMENT_COST
    
    # Productivity Savings
    productivity_gain = workload_level
    hours_saved_per_teacher = ASSESSMENT_HOURS_PER_WEEK * (productivity_gain / 100)
    hourly_rate = avg_salary / (WORK_WEEKS_PER_YEAR * AVG_HOURS_PER_WEEK)
    productivity_savings = school_size * hours_saved_per_teacher * WORK_WEEKS_PER_YEAR * hourly_rate
    
    # Total
    total_annual_savings = supply_teacher_savings + retention_savings + productivity_savings
    net_annual_benefit = total_annual_savings - annual_ai_cost
    payback_period = initial_cost / net_annual_benefit if net_annual_benefit > 0 else float('inf')
    
    # Yearly data
    yearly_data = []
    cumulative_cashflow = -initial_cost
    
    for year in range(1, time_horizon + 1):
        year_net = total_annual_savings - annual_ai_cost
        cumulative_cashflow += year_net
        roi = (cumulative_cashflow / (initial_cost + (annual_ai_cost * year))) * 100
        
        yearly_data.append({
            'year': f'Year {year}',
            'year_number': year,
            'cost': annual_ai_cost,
            'savings': total_annual_savings,
            'net_benefit': year_net,
            'cumulative_cashflow': cumulative_cashflow,
            'roi': roi,
            'supply_teacher_savings': supply_teacher_savings,
            'retention_savings': retention_savings,
            'productivity_savings': productivity_savings,
        })
    
    return {
        'annual_ai_cost': annual_ai_cost,
        'initial_cost': initial_cost,
        'supply_teacher_savings': supply_teacher_savings,
        'retention_savings': retention_savings,
        'productivity_savings': productivity_savings,
        'total_annual_savings': total_annual_savings,
        'net_annual_benefit': net_annual_benefit,
        'payback_period': payback_period,
        'teachers_retained': teachers_retained,
        'hours_saved_per_teacher': hours_saved_per_teacher,
        'yearly_data': yearly_data,
    }

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f'🚀 Mock API Server running on http://localhost:{port}')
    print(f'📊 API Docs: http://localhost:{port}/api/health')
    print(f'🧮 Calculate endpoint: POST http://localhost:{port}/api/calculate')
    print('\nPress Ctrl+C to stop\n')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
