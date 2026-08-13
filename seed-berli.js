import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedBerli() {
  console.log('Seeding data for Berli...');

  // 1. Get Berli's ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'berli@duofinance.com');
    
  if (userError || !users || users.length === 0) {
    console.error('Error fetching Berli:', userError);
    return;
  }
  
  const berliId = users[0].id;
  console.log('Berli ID:', berliId);

  // 2. Insert Wallets (with balances as of 9 August)
  const walletsData = [
    { user_id: berliId, name: 'Mandiri', balance: 200000 },
    { user_id: berliId, name: 'Spay', balance: 833000 },
    { user_id: berliId, name: 'Cash', balance: 856000 }
  ];

  const { data: wallets, error: walletError } = await supabase
    .from('wallets')
    .insert(walletsData)
    .select();

  if (walletError) {
    console.error('Error inserting wallets:', walletError);
    return;
  }
  
  const mandiriId = wallets.find(w => w.name === 'Mandiri').id;
  const spayId = wallets.find(w => w.name === 'Spay').id;
  const cashId = wallets.find(w => w.name === 'Cash').id;
  
  console.log('Wallets created.');

  // 3. Insert Transactions
  const transactions = [
    // 10 August (From Cash)
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 14500, description: 'Gojek', category: 'Transportasi', created_at: '2026-08-10T10:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 7000, description: 'Es gooday', category: 'Makanan', created_at: '2026-08-10T12:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 15000, description: 'Telur 1/2', category: 'Makanan', created_at: '2026-08-10T14:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 3500, description: 'Mie', category: 'Makanan', created_at: '2026-08-10T16:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 10000, description: 'Nabung', category: 'Nabung', created_at: '2026-08-10T20:00:00Z' },

    // 11 August (From Cash)
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 12000, description: 'Grab', category: 'Transportasi', created_at: '2026-08-11T09:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 5000, description: 'Angkot', category: 'Transportasi', created_at: '2026-08-11T17:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 5000, description: 'Nabung', category: 'Nabung', created_at: '2026-08-11T20:00:00Z' },
    
    // 11 August Adjustment for Spay (833k -> 768k = 65k)
    { user_id: berliId, wallet_id: spayId, type: 'expense', amount: 65000, description: 'Pengeluaran Spay (Tidak Tercatat/Selisih)', category: 'Lainnya', created_at: '2026-08-11T12:00:00Z' },

    // 12 August (From Cash)
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 17000, description: 'Jagung & brokoli', category: 'Makanan', created_at: '2026-08-12T09:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 12000, description: '2 ayam marinasi', category: 'Makanan', created_at: '2026-08-12T11:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 13000, description: 'Grab', category: 'Transportasi', created_at: '2026-08-12T13:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 3000, description: 'Angkot', category: 'Transportasi', created_at: '2026-08-12T17:00:00Z' },
    { user_id: berliId, wallet_id: cashId, type: 'expense', amount: 5000, description: 'Nabung', category: 'Nabung', created_at: '2026-08-12T20:00:00Z' }
  ];

  const { error: txError } = await supabase
    .from('transactions')
    .insert(transactions);

  if (txError) {
    console.error('Error inserting transactions:', txError);
    return;
  }

  console.log('Transactions inserted. Wallet triggers should have updated the balances!');
  console.log('Seeding complete.');
}

seedBerli();
