import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearDb() {
  console.log('Clearing database...');
  
  // 1. Delete all transactions
  const { error: txError } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (txError) {
    console.error('Error deleting transactions:', txError);
    return;
  }
  console.log('All transactions deleted.');

  // 2. Delete all wallets
  const { error: walletError } = await supabase.from('wallets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (walletError) {
    console.error('Error deleting wallets:', walletError);
    return;
  }
  console.log('All wallets deleted.');

  console.log('Database cleared successfully!');
}

clearDb();
