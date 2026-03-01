import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AuditLog(){
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    classification: '',
    decision_stage: '',
    dateFrom: '',
    dateTo: ''
  });

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.classification) params.append('classification', filters.classification);
      if (filters.decision_stage) params.append('decision_stage', filters.decision_stage);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const res = await api.get(`/api/audit-logs?${params.toString()}`);
      setLogs(res.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Audit load error', err);
      setError(err.response ? JSON.stringify(err.response.data) : err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []); // run once on mount

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadLogs();
  };

  const resetFilters = () => {
    setFilters({ classification: '', decision_stage: '', dateFrom: '', dateTo: '' });
  };

  const getStageColor = (stage) => {
    const colors = {
      'deduplication': '#9C27B0',
      'rule_evaluation': '#2196F3',
      'fatigue_check': '#FF9800',
      'ai_classification': '#4CAF50',
      'save': '#00BCD4',
      'audit_log': '#795548'
    };
    return colors[stage] || '#757575';
  };

  const getClassificationColor = (classification) => {
    const colors = {
      'NOW': '#FF9800',
      'LATER': '#FFC107',
      'NEVER': '#9E9E9E'
    };
    return colors[classification] || '#757575';
  };

  return (
    <div style={{maxWidth: 1200, margin: '24px auto'}}>
      <h1>📋 Audit Log</h1>
      <p>Complete decision history and processing pipeline tracking for all notifications</p>

      {/* Filters */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        border: '1px solid #ddd'
      }}>
        <h3 style={{marginTop: 0, marginBottom: 15}}>Filters</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 15}}>
          
          <div>
            <label><strong>Classification</strong></label>
            <select 
              value={filters.classification}
              onChange={e => handleFilterChange('classification', e.target.value)}
            >
              <option value="">All</option>
              <option value="NOW">NOW (Immediate)</option>
              <option value="LATER">LATER (Queued)</option>
              <option value="NEVER">NEVER (Filtered)</option>
            </select>
          </div>

          <div>
            <label><strong>Decision Stage</strong></label>
            <select 
              value={filters.decision_stage}
              onChange={e => handleFilterChange('decision_stage', e.target.value)}
            >
              <option value="">All</option>
              <option value="deduplication">Deduplication</option>
              <option value="rule_evaluation">Rule Evaluation</option>
              <option value="fatigue_check">Fatigue Check</option>
              <option value="ai_classification">AI Classification</option>
              <option value="save">Save</option>
              <option value="audit_log">Audit Log</option>
            </select>
          </div>

          <div>
            <label><strong>From Date</strong></label>
            <input 
              type="date"
              value={filters.dateFrom}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label><strong>To Date</strong></label>
            <input 
              type="date"
              value={filters.dateTo}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        <div style={{display: 'flex', gap: 10}}>
          <button 
            onClick={applyFilters}
            style={{padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          >
            Apply Filters
          </button>
          <button 
            onClick={resetFilters}
            style={{padding: '10px 20px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          >
            Reset
          </button>
        </div>
      </div>

      {error && <div style={{color: 'red', marginBottom: 20, padding: 15, backgroundColor: '#ffebee', borderRadius: 4}}>Error: {error}</div>}

      {/* Logs Table */}
      {loading ? (
        <div style={{textAlign: 'center', padding: 40}}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div style={{textAlign: 'center', padding: 40, backgroundColor: '#f5f5f5', borderRadius: 8, color: '#999'}}>
          No audit logs found. Create events to see decision history here.
        </div>
      ) : (
        <div style={{backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                <th style={{padding: 12, textAlign: 'left', fontWeight: 'bold'}}>Notification</th>
                <th style={{padding: 12, textAlign: 'center', fontWeight: 'bold'}}>Stage</th>
                <th style={{padding: 12, textAlign: 'center', fontWeight: 'bold'}}>Classification</th>
                <th style={{padding: 12, textAlign: 'left', fontWeight: 'bold'}}>Rule/Decision</th>
                <th style={{padding: 12, textAlign: 'left', fontWeight: 'bold'}}>AI Details</th>
                <th style={{padding: 12, textAlign: 'right', fontWeight: 'bold'}}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log._id} style={{borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'}}>
                  <td style={{padding: 12, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    <strong>{log.notification_id?.event_type || 'N/A'}</strong>
                    <br/>
                    <small style={{color: '#999'}}>{log.notification_id?.message?.substring(0, 50)}</small>
                  </td>
                  <td style={{padding: 12, textAlign: 'center'}}>
                    <span style={{
                      backgroundColor: getStageColor(log.decision_stage),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}>
                      {log.decision_stage?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{padding: 12, textAlign: 'center'}}>
                    <span style={{
                      backgroundColor: getClassificationColor(log.classification),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: 4,
                      fontWeight: 'bold'
                    }}>
                      {log.classification}
                    </span>
                  </td>
                  <td style={{padding: 12}}>
                    <strong>{log.rule_triggered || 'Fallback'}</strong>
                    {log.rule_triggered && <br/>}
                    {log.fatigue_limit && (
                      <small style={{color: '#999'}}>
                        Fatigue: {log.fatigue_limit} per {log.fatigue_window_minutes}min
                      </small>
                    )}
                  </td>
                  <td style={{padding: 12, fontSize: '0.9em', color: '#555'}}>
                    {/* show details if we have classification or if a fallback/error occurred */}
                    {log.ai_classification || log.ai_is_fallback || log.ai_error ? (
                      <>
                        {log.ai_classification && (
                          <>
                            <strong>Classification:</strong> {log.ai_classification}
                            <br/>
                          </>
                        )}
                        <strong>Model:</strong> {log.ai_model || 'gpt-4o-mini'}
                        <br/>
                        <strong>Attempts:</strong> {log.ai_attempts || 1}
                        {log.ai_is_fallback && <><br/><span style={{color: '#FF9800'}}>⚠️ Fallback used</span></>}
                        {log.ai_error && <><br/><span style={{color: '#f44336'}}>Error: {log.ai_error}</span></>}
                      </>
                    ) : (
                      <small style={{color: '#999'}}>—</small>
                    )}
                  </td>
                  <td style={{padding: 12, textAlign: 'right', fontSize: '0.85em', color: '#999', whiteSpace: 'nowrap'}}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div style={{marginTop: 30, padding: 15, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4CAF50', borderRadius: 4}}>
        <h4>📊 Audit Log Features:</h4>
        <ul style={{margin: 10}}>
          <li><strong>Complete Tracking:</strong> Every decision made during notification processing</li>
          <li><strong>Pipeline Stages:</strong> Deduplication → Rules → Fatigue → AI → Save → Audit</li>
          <li><strong>Rule Decisions:</strong> Which rule triggered and fatigue limits</li>
          <li><strong>AI Metadata:</strong> Classification, model, attempts, and fallback status</li>
          <li><strong>Filtering:</strong> Search by classification, stage, and date range</li>
          <li><strong>Immutable Records:</strong> Append-only audit trail for compliance</li>
        </ul>
      </div>
    </div>
  );
}
