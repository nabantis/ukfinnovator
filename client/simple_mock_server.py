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
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length == 0:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Missing Content-Length'}).encode())
                    return
                
                post_data = self.rfile.read(content_length)
                input_data = json.loads(post_data.decode())
                
                # ROI 계산
                result = calculate_roi(input_data)
                
                self._set_headers()
                self.wfile.write(json.dumps(result).encode())
            except json.JSONDecodeError as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': f'Invalid JSON: {str(e)}'}).encode())
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': f'Server error: {str(e)}'}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def calculate_roi(data):
    """
    5-year ROI calculation using explicit user inputs
    """

    YEARS = 5

    # USER INPUTS
    teachers = data.get("teachers", 100)

    avg_salary = data.get("avg_teacher_salary", 48892)
    on_cost_pct = data.get("employer_on_cost_pct", 0.3)

    weekly_hours = data.get("weekly_working_hours", 32.5)
    teaching_weeks = data.get("teaching_weeks_per_year", 39)

    # DERIVED PAY RATES (from user inputs)
    fully_loaded_salary = avg_salary * (1 + on_cost_pct)

    annual_hours = weekly_hours * teaching_weeks
    hourly_rate = fully_loaded_salary / annual_hours
    daily_rate = hourly_rate * (weekly_hours / 5)

    # ABSENCE ASSUMPTIONS
    absence_days = data.get("absence_days_per_teacher", 8)
    supply_cover_pct = data.get("supply_cover_pct", 1.0)
    supply_day_rate = data.get("supply_day_rate", daily_rate)
    absence_reduction_pct = data.get("absence_reduction_pct", 0.1)

    # RETENTION ASSUMPTIONS
    attrition_rate = data.get("attrition_rate", 0.088)
    retention_improvement = data.get("retention_improvement", 0.05)
    replacement_cost = data.get("replacement_cost", 20000)

    # ADOPTION & GROWTH
    initial_adoption = data.get("adoption_rate", 0.2)
    max_adoption = data.get("max_adoption_rate", 0.8)

    benefit_growth = data.get("annual_benefit_growth", 0.03)
    cost_inflation = data.get("annual_cost_increase", 0.02)

    adoption_step = (
        (max_adoption - initial_adoption) / (YEARS - 1)
        if YEARS > 1 else 0
    )

    # PRICING
    pricing_mode = data.get("pricing_mode", "Per Teacher")

    ai_cost_per_teacher = data.get("ai_cost_per_teacher", 100)
    ai_cost_per_school = data.get("ai_cost_per_school", 10000)
    scale_school_cost = data.get("scale_school_cost", 0)

    training_cost = data.get("training_cost", 2000)
    setup_cost = data.get("setup_cost", 1000)

    # BASELINE CALCULATIONS
    total_supply_days = teachers * absence_days * supply_cover_pct
    baseline_supply_cost = total_supply_days * supply_day_rate

    annual_results = []
    total_benefits = 0
    total_costs = 0

    # YEAR-BY-YEAR CALCULATION
    for year in range(1, YEARS + 1):
        adoption = min(
            initial_adoption + adoption_step * (year - 1),
            max_adoption
        )

        benefit_multiplier = (1 + benefit_growth) ** (year - 1)
        cost_multiplier = (1 + cost_inflation) ** (year - 1)

        # BENEFITS
        absence_savings = (
            baseline_supply_cost
            * absence_reduction_pct
            * adoption
            * benefit_multiplier
        )

        avoided_leavers = (
            teachers
            * attrition_rate
            * retention_improvement
            * adoption
        )

        retention_savings = (
            avoided_leavers
            * replacement_cost
            * benefit_multiplier
        )

        year_benefits = absence_savings + retention_savings

        # COSTS
        if pricing_mode == "Per Teacher":
            ai_subscription = (
                teachers
                * adoption
                * ai_cost_per_teacher
                * cost_multiplier
            )
        else:
            base_cost = (
                ai_cost_per_school * adoption
                if scale_school_cost
                else ai_cost_per_school
            )
            ai_subscription = base_cost * cost_multiplier

        year_costs = ai_subscription

        if year == 1:
            year_costs += training_cost + setup_cost

        # STORE RESULTS
        net_benefit = year_benefits - year_costs

        annual_results.append({
            "year": year,
            "adoption_rate": round(adoption, 2),
            "benefits": round(year_benefits, 2),
            "costs": round(year_costs, 2),
            "net_benefit": round(net_benefit, 2)
        })

        total_benefits += year_benefits
        total_costs += year_costs

    roi_pct = (
        (total_benefits - total_costs) / total_costs * 100
        if total_costs else 0
    )

    # OUTPUT
    return {
        "inputs_used": {
            "teachers": teachers,
            "avg_salary": avg_salary,
            "on_cost_pct": on_cost_pct,
            "weekly_hours": weekly_hours,
            "teaching_weeks": teaching_weeks,
            "hourly_rate": round(hourly_rate, 2),
            "daily_rate": round(daily_rate, 2),
        },
        "summary": {
            "total_benefits": round(total_benefits, 2),
            "total_costs": round(total_costs, 2),
            "net_benefit": round(total_benefits - total_costs, 2),
            "roi_percent": round(roi_pct, 1),
        },
        "annual_breakdown": annual_results
    }


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f'🚀 Mock API Server running on http://localhost:{port}')
    print(f'📊 Health Check: GET http://localhost:{port}/api/health')
    print(f'🧮 Calculate ROI: POST http://localhost:{port}/api/calculate')
    print('\nPress Ctrl+C to stop the server\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n✅ Server stopped')
        httpd.server_close()

if __name__ == '__main__':
    run_server()
