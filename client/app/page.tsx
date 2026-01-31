'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
  primary: '#9333ea',
  secondary: '#d97706',
  accent: '#10b981',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  light: '#f3f4f6',
  dark: '#1f2937',
};

const API_URL = 'http://localhost:8000';

interface YearlyData {
  year: string;
  year_number: number;
  cost: number;
  savings: number;
  net_benefit: number;
  cumulative_cashflow: number;
  roi: number;
  supply_teacher_savings: number;
  retention_savings: number;
  productivity_savings: number;
}

interface ROICalculation {
  annual_ai_cost: number;
  initial_cost: number;
  supply_teacher_savings: number;
  retention_savings: number;
  productivity_savings: number;
  total_annual_savings: number;
  net_annual_benefit: number;
  payback_period: number;
  teachers_retained: number;
  hours_saved_per_teacher: number;
  yearly_data: YearlyData[];
}

export default function Home() {
  // Input states
  const [schoolSize, setSchoolSize] = useState(50);
  const [avgSalary, setAvgSalary] = useState(48892);
  const [attritionRate, setAttritionRate] = useState(8.8);
  const [avgSickDays, setAvgSickDays] = useState(7);
  const [supplyRate, setSupplyRate] = useState(180);
  const [aiCostPerTeacher, setAiCostPerTeacher] = useState(100);
  const [workloadLevel, setWorkloadLevel] = useState(70);
  const [trainingCost, setTrainingCost] = useState(2000);
  const [setupCost, setSetupCost] = useState(1500);
  const [absenteeismReduction, setAbsenteeismReduction] = useState(20);
  const [retentionImprovement, setRetentionImprovement] = useState(5);
  const [timeHorizon, setTimeHorizon] = useState(5);

  const [calculations, setCalculations] = useState<ROICalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateROI = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_size: schoolSize,
          avg_salary: avgSalary,
          attrition_rate: attritionRate,
          avg_sick_days: avgSickDays,
          supply_rate: supplyRate,
          ai_cost_per_teacher: aiCostPerTeacher,
          workload_level: workloadLevel,
          training_cost: trainingCost,
          setup_cost: setupCost,
          absenteeism_reduction: absenteeismReduction,
          retention_improvement: retentionImprovement,
          time_horizon: timeHorizon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
      }

      const data = await response.json();
      setCalculations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on mount and when inputs change
  useState(() => {
    calculateROI();
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const savingsBreakdown = calculations ? [
    { name: 'Supply', value: calculations.supply_teacher_savings, color: COLORS.primary },
    { name: 'Retention', value: calculations.retention_savings, color: COLORS.success },
    { name: 'Productivity', value: calculations.productivity_savings, color: COLORS.secondary },
  ] : [];

  return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', minHeight: '100vh' }}>
          {/* LEFT PANEL - INPUTS */}
          <div style={{
            background: '#f9fafb',
            borderRight: '2px solid #e5e7eb',
            padding: '32px 24px',
            overflowY: 'auto',
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.dark }}>
              <span style={{ color: COLORS.primary }}>INPUT</span> PANEL
            </h1>

            {/* School Profile */}
            <Section title="School Profile">
              <InputField label="Number of Teachers" value={schoolSize} onChange={setSchoolSize} min={10} max={200} step={5} />
              <InputField label="Average Teacher Salary (£)" value={avgSalary} onChange={setAvgSalary} min={30000} max={90000} step={1000} />
              <InputField label="Annual Attrition Rate (%)" value={attritionRate} onChange={setAttritionRate} min={0} max={20} step={0.5} />
              <InputField label="Avg Sick Days per Year" value={avgSickDays} onChange={setAvgSickDays} min={3} max={15} step={1} />
              <InputField label="Supply Teacher Daily Cost (£)" value={supplyRate} onChange={setSupplyRate} min={100} max={250} step={10} />
            </Section>

            {/* AI Tool Assumptions */}
            <Section title="AI Tool Assumptions">
              <InputField label="AI Cost per Teacher / Year (£)" value={aiCostPerTeacher} onChange={setAiCostPerTeacher} min={50} max={200} step={10} />

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '12px' }}>
                  Workload Reduction Level
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[50, 70, 80].map(level => (
                      <button
                          key={level}
                          onClick={() => setWorkloadLevel(level)}
                          style={{
                            flex: 1,
                            padding: '12px 8px',
                            border: workloadLevel === level ? `2px solid ${COLORS.primary}` : '2px solid #e5e7eb',
                            background: workloadLevel === level ? '#ede9fe' : 'white',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: workloadLevel === level ? COLORS.primary : COLORS.dark,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                      >
                        {level}%
                      </button>
                  ))}
                </div>
              </div>

              <InputField label="Training Cost (One-time, £)" value={trainingCost} onChange={setTrainingCost} min={1000} max={5000} step={100} />
              <InputField label="Setup Cost (One-time, £)" value={setupCost} onChange={setSetupCost} min={500} max={5000} step={100} />
            </Section>

            {/* Impact Assumptions */}
            <Section title="Impact Assumptions">
              <InputField label="Absenteeism Reduction (%)" value={absenteeismReduction} onChange={setAbsenteeismReduction} min={0} max={50} step={5} />
              <InputField label="Retention Improvement (pp)" value={retentionImprovement} onChange={setRetentionImprovement} min={0} max={10} step={0.5} />
            </Section>

            {/* Time Horizon */}
            <Section title="Time Horizon">
              <div style={{ display: 'flex', gap: '12px' }}>
                {[3, 5].map(years => (
                    <button
                        key={years}
                        onClick={() => setTimeHorizon(years)}
                        style={{
                          flex: 1,
                          padding: '16px',
                          border: timeHorizon === years ? `2px solid ${COLORS.secondary}` : '2px solid #e5e7eb',
                          background: timeHorizon === years ? '#fef3c7' : 'white',
                          borderRadius: '8px',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: timeHorizon === years ? COLORS.secondary : COLORS.dark,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                    >
                      {years} Years
                    </button>
                ))}
              </div>
            </Section>

            {/* Calculate Button */}
            <button
                onClick={calculateROI}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#9ca3af' : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '20px',
                }}
            >
              {loading ? 'Calculating...' : 'Calculate ROI'}
            </button>

            {error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '14px',
                }}>
                  {error}
                </div>
            )}
          </div>

          {/* RIGHT PANEL - CHARTS */}
          <div style={{ padding: '32px', overflowY: 'auto' }}>
            {calculations ? (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: COLORS.dark }}>
                    KEY METRICS (<span style={{ color: COLORS.primary }}>SUMMARY</span> CARDS)
                  </h2>

                  {/* Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <MetricCard
                        label="ROI (%)"
                        value={`${calculations.yearly_data[timeHorizon - 1].roi.toFixed(1)}%`}
                        icon={<TrendingUp size={24} />}
                        color={COLORS.success}
                    />
                    <MetricCard
                        label="Break-even"
                        value={`${calculations.payback_period.toFixed(1)}y`}
                        icon={<Clock size={24} />}
                        color={COLORS.secondary}
                    />
                    <MetricCard
                        label="Net Savings £"
                        value={formatCurrency(calculations.net_annual_benefit * timeHorizon + calculations.initial_cost)}
                        icon={<DollarSign size={24} />}
                        color={COLORS.primary}
                    />
                  </div>

                  {/* Main Chart */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '32px',
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: COLORS.dark }}>
                      MAIN CHART
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                      Cumulative Cashflow <span style={{ color: COLORS.success, fontWeight: '600' }}>Line</span>
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={calculations.yearly_data}>
                        <defs>
                          <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" style={{ fontSize: '13px' }} stroke="#6b7280" />
                        <YAxis style={{ fontSize: '13px' }} stroke="#6b7280" tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                            contentStyle={{ background: 'white', border: '2px solid ' + COLORS.primary, borderRadius: '8px', fontSize: '13px' }}
                            formatter={(v: any) => formatCurrency(v)}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulative_cashflow"
                            stroke={COLORS.success}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCashflow)"
                            name="Cumulative Cashflow"
                        />
                        <Line
                            type="monotone"
                            dataKey={() => 0}
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Break-even Line"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Supporting Charts */}
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: COLORS.dark }}>
                    SUPPORTING CHARTS
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                    Savings Breakdown / Scenarios
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Stacked Bar Chart */}
                    <ChartCard title="Savings Breakdown by Year">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calculations.yearly_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="year" style={{ fontSize: '12px' }} />
                          <YAxis style={{ fontSize: '12px' }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                              contentStyle={{ background: 'white', border: '2px solid ' + COLORS.primary, borderRadius: '8px', fontSize: '12px' }}
                              formatter={(v: any) => formatCurrency(v)}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="supply_teacher_savings" stackId="a" fill={COLORS.primary} name="Supply Teacher" />
                          <Bar dataKey="retention_savings" stackId="a" fill={COLORS.success} name="Retention" />
                          <Bar dataKey="productivity_savings" stackId="a" fill={COLORS.secondary} name="Productivity" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie Chart */}
                    <ChartCard title="Annual Savings Distribution">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                              data={savingsBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                          >
                            {savingsBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                              contentStyle={{ background: 'white', border: '2px solid ' + COLORS.primary, borderRadius: '8px', fontSize: '12px' }}
                              formatter={(v: any) => formatCurrency(v)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    {/* Cost vs Savings */}
                    <ChartCard title="Cost vs Savings Comparison">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calculations.yearly_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="year" style={{ fontSize: '12px' }} />
                          <YAxis style={{ fontSize: '12px' }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                              contentStyle={{ background: 'white', border: '2px solid ' + COLORS.primary, borderRadius: '8px', fontSize: '12px' }}
                              formatter={(v: any) => formatCurrency(v)}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="cost" fill={COLORS.danger} name="AI Cost" />
                          <Bar dataKey="savings" fill={COLORS.success} name="Total Savings" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    {/* ROI Timeline */}
                    <ChartCard title="ROI % Timeline">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={calculations.yearly_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="year" style={{ fontSize: '12px' }} />
                          <YAxis style={{ fontSize: '12px' }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                          <Tooltip
                              contentStyle={{ background: 'white', border: '2px solid ' + COLORS.primary, borderRadius: '8px', fontSize: '12px' }}
                              formatter={(v: any) => `${v.toFixed(1)}%`}
                          />
                          <Line
                              type="monotone"
                              dataKey="roi"
                              stroke={COLORS.primary}
                              strokeWidth={3}
                              dot={{ fill: COLORS.primary, r: 5 }}
                              name="ROI %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>

                  {/* Footer */}
                  <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    <strong>UKFinnovator 2026 Challenge</strong> | FinTech for EdTech |
                    Sponsor: <a href="http://mysmartteach.com/" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '600' }}>My Smart Teach</a>
                  </div>
                </>
            ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontSize: '18px',
                  color: '#9ca3af',
                }}>
                  {loading ? 'Loading...' : 'Click "Calculate ROI" to see results'}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

// Components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '16px',
        color: COLORS.dark,
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '8px',
      }}>
        {title}
      </h3>
      {children}
    </div>
);

const InputField = ({ label, value, onChange, min, max, step }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.dark,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
      />
    </div>
);

const MetricCard = ({ label, value, icon, color }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
    <div style={{
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <div style={{ color: color }}>
          {icon}
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#6b7280',
        }}>
          {label}
        </div>
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: color,
      }}>
        {value}
      </div>
    </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
        color: COLORS.dark,
      }}>
        {title}
      </h4>
      {children}
    </div>
);