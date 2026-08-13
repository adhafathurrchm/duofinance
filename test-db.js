import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing connection...");
  const { data, error } = await supabase.from('users').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
