import { generateNumericCode } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://tzsbbbxpdlupybfrgdbs.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2JiYnhwZGx1cHliZnJnZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzU0MTEsImV4cCI6MjA2NzU1MTQxMX0.3MPot37N05kaUG8W84JItSKgH2bymVBee1MxJ905XEk'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
    debug: true // This will print realtime connection logs
})

export default supabase





//LOGIN
export async function vendorLogin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("Users error", error)
    return { errorMsg: error.message, data: null };
  }
  
  const { data: infoData, error: infoError } = await getVendorDetails({ id: data.user.id })

  if(infoError){
    return {
      data: null,
      errorMsg: infoError
    }
  }

  return {
    data: {
      session: data?.session,
      user: data.user,
      ...infoData      
    },
    errorMsg: null
  }
}
export async function getVendorDetails({ id }){
  const { data: bankData, error: bankError } = await supabase
    .from("banks")
    .select('*')
    .eq('provider_id', id) 

  const { data: profileData, error: profileError } = await supabase
    .from("providers")
    .select('*')
    .eq('id', id) 
    .single(); 

  const { data: phone_number, error: phone_number_error } = await supabase
    .from('unique_phones')
    .select('*')
    .eq('user_id', id)

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      *,
      types: service_types ( * )  
    `)
    .eq('provider_id', id) 
    .limit(1000) 

  const { data: bookingsData, error: bookingsError } = await supabase
    .from('all_bookings')
    .select(`
      *,
      user_profile: user_profiles(*),
      serviceInfo: services(*)
    `)
    .eq('provider_id', id)
    .order("day", { ascending: true, nullsFirst: false })      
    .order('start_time', { ascending: true, nullsFirst: false })
    .limit(1000)    

  if(
      profileError
      ||
      servicesError
      ||
      bookingsError
      ||
      phone_number_error
      || 
      bankError
    ){
    console.log("Profile error", profileError)
    console.log("Services error", servicesError)
    console.log("Bookings error", bookingsError)
    console.log("Phone number error", phone_number_error)
    console.log("banks error", bankError)
    return { error: "Error getting vendor profile", data: null };
  }

  return{
    data: {
      profile: profileData,
      services: services,
      bookings: bookingsData,
      phone_number: phone_number[0],
      bank: bankData[0]
    },
    error: null
  }
}






// OTP 
export async function createOrUpdateOtp({ email, requiresAuth }) {
    // 1. Check if user exists in auth.users
    const { data: userExistsData, error: existsError } = await supabase
        .rpc('user_exists', { email_input: email });

    const userAlreadyExists = userExistsData === true ? true : false

    if(requiresAuth){
        if(!userAlreadyExists){
            return { userAlreadyExists }
        }

    } else{
        if (userAlreadyExists) {
            return { userAlreadyExists };
        }
    }


    // 2. Generate 6-digit OTP
    const otp = generateNumericCode(6)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Upsert into otps
    const { error: otpError } = await supabase
        .from('otps')
        .upsert(
            {
                email,
                otp,
                expires_at: expiresAt,
            },
            { onConflict: ['email'] }
    );

    if (otpError) {
        console.log('Error upserting OTP:', otpError);

        if(requiresAuth){
            return { error: 'Error sending OTP to mail', userAlreadyExists }
        }

        return { error: 'Error sending OTP to mail' }
    }

    if(requiresAuth){
        return { token: { otp, expiresAt }, userAlreadyExists };
    }

    return { token: { otp, expiresAt } };
}
export async function validateOtp({ email, otp }) {
  const { data: isValid, error } = await supabase
    .rpc('validate_otp', { provider_email: email, provider_otp: otp });

  if (error) {
    console.error('OTP validation error:', error);
    throw error;
  }

  return isValid; // boolean
}

export async function checkPhoneNumberExists({ phone_number }) {
  const { data: isUsed, error } = await supabase
    .rpc('check_phone_number_exists', { p_phone: phone_number });
    
  if (error) {
    console.error('Phone number check error:', error);
    throw error;
  }

  return isUsed; // boolean
}