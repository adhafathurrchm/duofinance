import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtsgefvzarvpsqhjatow.supabase.co';
const supabaseAnonKey = 'sb_publishable_yzPImPShgrBHZ83aPgwYbg_xpCkhtPW';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixCategories() {
  console.log('Fixing categories for transfer and topup...');

  const { error: err1 } = await supabase
    .from('transactions')
    .update({ category: 'Transfer Dompet' })
    .eq('description', 'Transfer ke Shopeepay');

  if (err1) console.error('Error 1:', err1);

  const { error: err2 } = await supabase
    .from('transactions')
    .update({ category: 'Topup' })
    .eq('description', 'Topup dari Cash');

  if (err2) console.error('Error 2:', err2);

  console.log('Categories fixed successfully!');
}

fixCategories();
