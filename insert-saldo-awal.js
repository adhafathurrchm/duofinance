import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertSaldoAwal() {
  console.log('Fetching users and wallets...');

  const { data: users } = await supabase.from('users').select('id, email');
  const fathur = users.find(u => u.email === 'fathur@duofinance.com');
  const berli = users.find(u => u.email === 'berli@duofinance.com');

  const { data: wallets } = await supabase.from('wallets').select('*');

  const initialBalances = {
    [fathur.id]: {
      'Cash': 150000,
      'BSI': 67000,
      'Shopeepay': 250000,
      'Dana': 2000,
      'Seabank': 5000
    },
    [berli.id]: {
      'Mandiri': 200000,
      'Spay': 833000,
      'Cash': 856000
    }
  };

  const dates = {
    [fathur.id]: '2026-08-01T00:00:00Z',
    [berli.id]: '2026-08-09T00:00:00Z'
  };

  const transactionsToInsert = [];

  for (const wallet of wallets) {
    const initialBalance = initialBalances[wallet.user_id]?.[wallet.name];
    if (initialBalance) {
      transactionsToInsert.push({
        user_id: wallet.user_id,
        wallet_id: wallet.id,
        type: 'income',
        amount: initialBalance,
        description: 'Saldo Awal ' + wallet.name,
        category: 'Saldo Awal',
        created_at: dates[wallet.user_id]
      });
    }
  }

  // 1. Insert transactions (will trigger update_wallet_balance)
  const { error: txError } = await supabase.from('transactions').insert(transactionsToInsert);
  if (txError) {
    console.error('Error inserting saldo awal:', txError);
    return;
  }
  
  console.log('Inserted Saldo Awal transactions.');

  // 2. Revert the wallet balances back to their actual correct state before this script
  for (const wallet of wallets) {
    await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
  }

  console.log('Restored correct wallet balances. Done!');
}

insertSaldoAwal();
