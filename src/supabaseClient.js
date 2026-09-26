import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

const createFallbackClient = () => {
  const makeQuery = () => {
    const query = {
      select: () => query,
      eq: () => query,
      neq: () => query,
      gt: () => query,
      gte: () => query,
      lt: () => query,
      lte: () => query,
      is: () => query,
      in: () => query,
      contains: () => query,
      containedBy: () => query,
      overlaps: () => query,
      like: () => query,
      ilike: () => query,
      not: () => query,
      or: () => query,
      filter: () => query,
      order: () => query,
      limit: () => query,
      range: () => query,
      insert: () => query,
      update: () => query,
      delete: () => query,
      upsert: () => query,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve, reject) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
    };

    return query;
  };

  return {
    from: () => makeQuery(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({ unsubscribe: () => {} }) }),
    removeChannel: () => {},
    rpc: async () => ({ data: null, error: null }),
  };
};

const useRemoteSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_URL !== 'https://demo-project.supabase.co');

export const supabase = useRemoteSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createFallbackClient();