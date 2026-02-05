import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * useRealtime - Component-level realtime subscription + polling fallback
 * 
 * Usage:
 *   const { data, loading, refetch } = useRealtime('tasks', {
 *     select: '*',
 *     orderBy: 'created_at',
 *     ascending: false,
 *     filters: [{ column: 'status', op: 'eq', value: 'in-progress' }],
 *     pollInterval: 10000,  // fallback polling ms (0 to disable)
 *     enabled: true,
 *   })
 */
export function useRealtime(table, options = {}) {
  const {
    select = '*',
    orderBy = 'created_at',
    ascending = false,
    filters = [],
    pollInterval = 10000,
    enabled = true,
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!enabled) return
    if (!silent) setLoading(true)

    try {
      let query = supabase.from(table).select(select)

      filters.forEach(({ column, op, value }) => {
        if (op === 'eq') query = query.eq(column, value)
        else if (op === 'neq') query = query.neq(column, value)
        else if (op === 'ilike') query = query.ilike(column, value)
        else if (op === 'in') query = query.in(column, value)
        else if (op === 'gte') query = query.gte(column, value)
        else if (op === 'lte') query = query.lte(column, value)
        else if (op === 'or') query = query.or(value)
      })

      if (orderBy) {
        query = query.order(orderBy, { ascending })
      }

      const { data: result, error: queryError } = await query
      if (queryError) throw queryError
      if (mountedRef.current) {
        setData(result || [])
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      if (mountedRef.current && !silent) setLoading(false)
    }
  }, [table, select, orderBy, ascending, JSON.stringify(filters), enabled])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [fetchData])

  // Realtime subscription
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`realtime-${table}-${JSON.stringify(filters)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => { fetchData(true) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, enabled, fetchData])

  // Polling fallback
  useEffect(() => {
    if (!enabled || !pollInterval) return
    const interval = setInterval(() => fetchData(true), pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * useRealtimeRow - Subscribe to changes on a single row
 * 
 * Usage:
 *   const { data, loading } = useRealtimeRow('task_activity', {
 *     filter: { column: 'task_id', value: taskId },
 *     orderBy: 'created_at',
 *     ascending: true,
 *     pollInterval: 5000,
 *   })
 */
export function useRealtimeRow(table, options = {}) {
  const {
    filter,
    select = '*',
    orderBy = 'created_at',
    ascending = true,
    pollInterval = 5000,
    enabled = true,
  } = options

  const filters = filter ? [{ column: filter.column, op: 'eq', value: filter.value }] : []

  return useRealtime(table, {
    select,
    orderBy,
    ascending,
    filters,
    pollInterval,
    enabled,
  })
}
