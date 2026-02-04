import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { select = '*', orderBy = 'created_at', ascending = false, filters = [], enabled = true } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from(table).select(select)

      filters.forEach(({ column, operator, value }) => {
        if (operator === 'eq') query = query.eq(column, value)
        else if (operator === 'ilike') query = query.ilike(column, value)
        else if (operator === 'in') query = query.in(column, value)
        else if (operator === 'gte') query = query.gte(column, value)
        else if (operator === 'lte') query = query.lte(column, value)
      })

      if (orderBy) {
        query = query.order(orderBy, { ascending })
      }

      const { data: result, error: queryError } = await query
      if (queryError) throw queryError
      setData(result || [])
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching ${table}:`, err)
    } finally {
      setLoading(false)
    }
  }, [table, select, orderBy, ascending, JSON.stringify(filters), enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const insert = async (record) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: mutationError } = await supabase
        .from(table)
        .insert(record)
        .select()
        .single()
      if (mutationError) throw mutationError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id, record) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: mutationError } = await supabase
        .from(table)
        .update(record)
        .eq('id', id)
        .select()
        .single()
      if (mutationError) throw mutationError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const { error: mutationError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      if (mutationError) throw mutationError
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { insert, update, remove, loading, error }
}
