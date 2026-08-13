import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding dummy data...');

  // 1. Get users
  const { data: users, error: userError } = await supabase.from('users').select('*');
  if (userError || !users.length) {
    console.error('Error fetching users or no users found:', userError);
    return;
  }

  const fathur = users.find(u => u.name === 'Fathur');
  const berli = users.find(u => u.name === 'Berli');

  if (!fathur || !berli) {
    console.error('Missing required users');
    return;
  }

  // 2. Create wallets
  const { data: walletsData, error: walletError } = await supabase.from('wallets').insert([
    { user_id: fathur.id, name: 'BCA Utama', balance: 5000000 },
    { user_id: fathur.id, name: 'Gopay', balance: 250000 },
    { user_id: berli.id, name: 'Mandiri', balance: 4200000 },
    { user_id: berli.id, name: 'ShopeePay', balance: 800000 },
  ]).select();

  if (walletError) {
    console.error('Error creating wallets:', walletError);
    return;
  }

  const bca = walletsData.find(w => w.name === 'BCA Utama');
  const gopay = walletsData.find(w => w.name === 'Gopay');
  const mandiri = walletsData.find(w => w.name === 'Mandiri');
  const shopee = walletsData.find(w => w.name === 'ShopeePay');

  const today = new Date();
  
  // Helper to subtract days
  const subDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  // 3. Create transactions
  const transactions = [
    // Fathur's transactions
    { user_id: fathur.id, wallet_id: bca.id, type: 'income', amount: 8000000, description: 'Gaji Bulanan', category: 'Gaji', created_at: subDays(10) },
    { user_id: fathur.id, wallet_id: bca.id, type: 'expense', amount: 2000000, description: 'Bayar Kos', category: 'Tagihan', created_at: subDays(9) },
    { user_id: fathur.id, wallet_id: gopay.id, type: 'income', amount: 500000, description: 'Topup Gopay', category: 'Lainnya', created_at: subDays(8) },
    { user_id: fathur.id, wallet_id: bca.id, type: 'expense', amount: 500000, description: 'Topup Gopay', category: 'Transportasi', created_at: subDays(8) }, // The source of topup
    { user_id: fathur.id, wallet_id: gopay.id, type: 'expense', amount: 45000, description: 'GoRide ke Kantor', category: 'Transportasi', created_at: subDays(7) },
    { user_id: fathur.id, wallet_id: gopay.id, type: 'expense', amount: 80000, description: 'Makan Siang Sederhana', category: 'Makanan', created_at: subDays(6) },
    { user_id: fathur.id, wallet_id: bca.id, type: 'expense', amount: 1200000, description: 'Beli Sepatu', category: 'Belanja', created_at: subDays(3) },
    { user_id: fathur.id, wallet_id: gopay.id, type: 'expense', amount: 120000, description: 'Nonton Bioskop', category: 'Hiburan', created_at: subDays(1) },

    // Berli's transactions
    { user_id: berli.id, wallet_id: mandiri.id, type: 'income', amount: 7500000, description: 'Gaji Bulanan', category: 'Gaji', created_at: subDays(11) },
    { user_id: berli.id, wallet_id: mandiri.id, type: 'expense', amount: 1500000, description: 'Cicilan Laptop', category: 'Tagihan', created_at: subDays(10) },
    { user_id: berli.id, wallet_id: shopee.id, type: 'income', amount: 1000000, description: 'Topup ShopeePay', category: 'Lainnya', created_at: subDays(9) },
    { user_id: berli.id, wallet_id: mandiri.id, type: 'expense', amount: 1000000, description: 'Topup ShopeePay', category: 'Lainnya', created_at: subDays(9) },
    { user_id: berli.id, wallet_id: shopee.id, type: 'expense', amount: 250000, description: 'Skincare', category: 'Belanja', created_at: subDays(8) },
    { user_id: berli.id, wallet_id: shopee.id, type: 'expense', amount: 150000, description: 'Belanja Bulanan', category: 'Belanja', created_at: subDays(5) },
    { user_id: berli.id, wallet_id: mandiri.id, type: 'expense', amount: 300000, description: 'Nongkrong Cafe', category: 'Hiburan', created_at: subDays(2) },
    { user_id: berli.id, wallet_id: shopee.id, type: 'expense', amount: 40000, description: 'Boba', category: 'Makanan', created_at: subDays(0) },
  ];

  const { error: txError } = await supabase.from('transactions').insert(transactions);
  if (txError) {
    console.error('Error creating transactions:', txError);
    return;
  }

  console.log('Dummy data seeded successfully!');
}

seed();
