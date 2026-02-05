import { useState, useMemo } from 'react'
import {
  DollarSign, Users, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Download, Info,
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'

// Sample payroll data (placeholder until Brittco integration is live)
const SAMPLE_STAFF = [
  { id: 1, name: 'Marie Johnson', role: 'RN', regular: 72, overtime: 4, osoc: 8 },
  { id: 2, name: 'Denise Williams', role: 'LPN', regular: 80, overtime: 0, osoc: 4 },
  { id: 3, name: 'Tanya Brooks', role: 'CNA', regular: 76, overtime: 6, osoc: 0 },
  { id: 4, name: 'James Carter', role: 'RN', regular: 80, overtime: 2, osoc: 12 },
  { id: 5, name: 'Sandra Mitchell', role: 'HHA', regular: 64, overtime: 0, osoc: 0 },
  { id: 6, name: 'Patricia Lewis', role: 'CNA', regular: 80, overtime: 8, osoc: 4 },
  { id: 7, name: 'Kevin Thomas', role: 'LPN', regular: 72, overtime: 0, osoc: 8 },
  { id: 8, name: 'Angela Davis', role: 'RN', regular: 80, overtime: 10, osoc: 16 },
]

function getPayrollPeriod(date) {
  // 2-week periods aligned to Sunday
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(addWeeks(start, 1), { weekStartsOn: 0 })
  return { start, end }
}

export default function PayrollPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const period = useMemo(() => getPayrollPeriod(currentDate), [currentDate])

  const totals = useMemo(() => {
    const totalRegular = SAMPLE_STAFF.reduce((s, r) => s + r.regular, 0)
    const totalOvertime = SAMPLE_STAFF.reduce((s, r) => s + r.overtime, 0)
    const totalOsoc = SAMPLE_STAFF.reduce((s, r) => s + r.osoc, 0)
    return {
      staff: SAMPLE_STAFF.length,
      regular: totalRegular,
      overtime: totalOvertime,
      osoc: totalOsoc,
      total: totalRegular + totalOvertime + totalOsoc,
    }
  }, [])

  function prevPeriod() {
    setCurrentDate(prev => subWeeks(prev, 2))
  }

  function nextPeriod() {
    setCurrentDate(prev => addWeeks(prev, 2))
  }

  return (
    <div className="space-y-4">
      {/* Brittco Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Coming Soon: Auto-import from Brittco</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Payroll data will automatically sync from Brittco once admin access is granted. Currently showing sample data.
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <button onClick={prevPeriod} className="btn btn-secondary btn-sm">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-text">
              {format(period.start, 'MMM d, yyyy')} — {format(period.end, 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-text-muted">Biweekly Payroll Period (Sun–Sat)</p>
          </div>
          <button onClick={nextPeriod} className="btn btn-secondary btn-sm">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totals.staff}</p>
              <p className="text-xs text-text-muted">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totals.total}</p>
              <p className="text-xs text-text-muted">Total Hours</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totals.overtime}</p>
              <p className="text-xs text-text-muted">Overtime Hours</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totals.osoc}</p>
              <p className="text-xs text-text-muted">OSOC Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Staff Hours Summary</h3>
          <button className="btn btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Staff Member</th>
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Role</th>
                <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Regular</th>
                <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Overtime</th>
                <th className="text-right text-xs font-medium text-text-muted px-4 py-3">OSOC</th>
                <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_STAFF.map(staff => (
                <tr key={staff.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text">{staff.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-info">{staff.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary">{staff.regular}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className={staff.overtime > 0 ? 'text-amber-600 font-medium' : 'text-text-secondary'}>
                      {staff.overtime}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className={staff.osoc > 0 ? 'text-purple-600 font-medium' : 'text-text-secondary'}>
                      {staff.osoc}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-text">
                    {staff.regular + staff.overtime + staff.osoc}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-alt">
                <td className="px-4 py-3 text-sm font-semibold text-text" colSpan={2}>Totals</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-text">{totals.regular}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-amber-600">{totals.overtime}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-purple-600">{totals.osoc}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-text">{totals.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
