import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedFathur() {
  console.log('Seeding data for Fathur...');

  // 1. Get Fathur's ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'fathur@duofinance.com');
    
  if (userError || !users || users.length === 0) {
    console.error('Error fetching Fathur:', userError);
    return;
  }
  
  const fathurId = users[0].id;
  console.log('Fathur ID:', fathurId);

  // 2. Insert Wallets (with balances as of 1 August)
  const walletsData = [
    { user_id: fathurId, name: 'Cash', balance: 150000 },
    { user_id: fathurId, name: 'BSI', balance: 67000 },
    { user_id: fathurId, name: 'Shopeepay', balance: 250000 },
    { user_id: fathurId, name: 'Dana', balance: 2000 },
    { user_id: fathurId, name: 'Seabank', balance: 5000 }
  ];

  const { data: wallets, error: walletError } = await supabase
    .from('wallets')
    .insert(walletsData)
    .select();

  if (walletError) {
    console.error('Error inserting wallets:', walletError);
    return;
  }
  
  const cashId = wallets.find(w => w.name === 'Cash').id;
  const bsiId = wallets.find(w => w.name === 'BSI').id;
  const spayId = wallets.find(w => w.name === 'Shopeepay').id;
  const seabankId = wallets.find(w => w.name === 'Seabank').id;
  
  console.log('Wallets created.');

  // 3. Insert Transactions
  const transactions = [
    // 2 Agustus
    { user_id: fathurId, wallet_id: bsiId, type: 'expense', amount: 31000, description: 'Makan di kereta', category: 'Makanan', created_at: '2026-08-02T10:00:00Z' },

    // 3 Agustus
    { user_id: fathurId, wallet_id: bsiId, type: 'expense', amount: 3800, description: 'Le minerale', category: 'Makanan', created_at: '2026-08-03T10:00:00Z' },
    { user_id: fathurId, wallet_id: bsiId, type: 'expense', amount: 10000, description: 'Nasi Geprek', category: 'Makanan', created_at: '2026-08-03T12:00:00Z' },
    { user_id: fathurId, wallet_id: spayId, type: 'expense', amount: 50000, description: 'Bantal', category: 'Lainnya', created_at: '2026-08-03T19:42:00Z' },
    // Adjustment to match 22K exact for BSI on Aug 3: Initial 67k - 31k - 3.8k - 10k = 22.2k. Needs -200 adjustment.
    { user_id: fathurId, wallet_id: bsiId, type: 'expense', amount: 200, description: 'Selisih', category: 'Lainnya', created_at: '2026-08-03T23:00:00Z' },

    // 4 Agustus
    { user_id: fathurId, wallet_id: seabankId, type: 'income', amount: 75000, description: 'Pemasukan SeaBank', category: 'Bonus', created_at: '2026-08-04T10:00:00Z' },
    { user_id: fathurId, wallet_id: seabankId, type: 'expense', amount: 28400, description: 'Bayar ESP', category: 'Tagihan', created_at: '2026-08-04T20:12:00Z' },
    // Adjustment for Seabank on Aug 4: 5K + 75K - 28.4K = 51.6K. User says 51K. Needs -600 adjustment.
    { user_id: fathurId, wallet_id: seabankId, type: 'expense', amount: 600, description: 'Selisih', category: 'Lainnya', created_at: '2026-08-04T23:00:00Z' },

    // 5 Agustus
    { user_id: fathurId, wallet_id: bsiId, type: 'expense', amount: 21500, description: 'Pulsa', category: 'Tagihan', created_at: '2026-08-05T10:00:00Z' },
    { user_id: fathurId, wallet_id: seabankId, type: 'expense', amount: 14000, description: 'Degan', category: 'Makanan', created_at: '2026-08-05T19:09:00Z' },
    // Adjustment for Seabank on Aug 5: 51K - 14K = 37K. User says 38K. Needs +1000 adjustment.
    { user_id: fathurId, wallet_id: seabankId, type: 'income', amount: 1000, description: 'Selisih', category: 'Lainnya', created_at: '2026-08-05T23:00:00Z' },

    // 6 Agustus
    { user_id: fathurId, wallet_id: cashId, type: 'expense', amount: 10000, description: 'Ubi', category: 'Makanan', created_at: '2026-08-06T20:00:00Z' },

    // 7 Agustus
    { user_id: fathurId, wallet_id: spayId, type: 'expense', amount: 41000, description: 'Pulsa Three', category: 'Tagihan', created_at: '2026-08-07T16:47:00Z' },

    // 8 Agustus
    { user_id: fathurId, wallet_id: cashId, type: 'income', amount: 50000, description: 'Pemberian', category: 'Bonus', created_at: '2026-08-08T10:00:00Z' },
    { user_id: fathurId, wallet_id: cashId, type: 'income', amount: 100000, description: 'Pemberian', category: 'Bonus', created_at: '2026-08-08T11:00:00Z' },
    { user_id: fathurId, wallet_id: cashId, type: 'income', amount: 100000, description: 'Pemberian', category: 'Bonus', created_at: '2026-08-08T12:00:00Z' },
    { user_id: fathurId, wallet_id: spayId, type: 'expense', amount: 16500, description: 'Sabun Cuci', category: 'Belanja', created_at: '2026-08-08T20:00:00Z' },
    { user_id: fathurId, wallet_id: spayId, type: 'expense', amount: 111000, description: 'Parfume', category: 'Belanja', created_at: '2026-08-08T23:38:00Z' },

    // 9 Agustus
    { user_id: fathurId, wallet_id: cashId, type: 'expense', amount: 25000, description: 'Potong Rambut', category: 'Lainnya', created_at: '2026-08-09T10:00:00Z' },
    { user_id: fathurId, wallet_id: seabankId, type: 'expense', amount: 22000, description: 'Jajan', category: 'Makanan', created_at: '2026-08-09T15:00:00Z' },
    // Transfer Cash to Shopeepay 200k
    { user_id: fathurId, wallet_id: cashId, type: 'expense', amount: 200000, description: 'Transfer ke Shopeepay', category: 'Lainnya', created_at: '2026-08-09T18:00:00Z' },
    { user_id: fathurId, wallet_id: spayId, type: 'income', amount: 200500, description: 'Topup dari Cash', category: 'Lainnya', created_at: '2026-08-09T18:00:00Z' },

    // 10 Agustus
    { user_id: fathurId, wallet_id: cashId, type: 'expense', amount: 7000, description: 'Beli Le Minerale 2', category: 'Makanan', created_at: '2026-08-10T10:00:00Z' },
    { user_id: fathurId, wallet_id: cashId, type: 'expense', amount: 8000, description: 'Maxim', category: 'Transportasi', created_at: '2026-08-10T14:00:00Z' },

    // 11 Agustus
    { user_id: fathurId, wallet_id: spayId, type: 'expense', amount: 11000, description: 'Beli es teh 2', category: 'Makanan', created_at: '2026-08-11T21:00:00Z' }
  ];

  const { error: txError } = await supabase
    .from('transactions')
    .insert(transactions);

  if (txError) {
    console.error('Error inserting transactions:', txError);
    return;
  }

  console.log('Transactions inserted for Fathur. Wallet triggers should have updated the balances!');
  console.log('Seeding complete.');
}

seedFathur();
