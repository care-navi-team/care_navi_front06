
import { supabase } from './supabase';
import { User, Character, SignUpRequest, SignInRequest } from '../types';
import { DEFAULT_CHARACTER_NAME, DEFAULT_CHARACTER_STAGE } from '../utils/constants';
import { getTodayDate } from '../utils/helpers';

interface SignUpResponse {
  user: User;
  character: Character;
}

interface SignInResponse {
  user: User;
}

/**
 * Helper to wait and retry fetching data (for trigger-created records)
 */
async function waitForRecord<T>(
  fetchFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 5,
  delayMs = 500
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await fetchFn();
    if (data && !error) return data;
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

/**
 * Helper for existing users - sign in and setup profile if needed
 */
async function signInAndSetup(request: SignUpRequest): Promise<SignUpResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to sign in');

  const userId = data.user.id;

  // Get or create user profile
  let { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!userData) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ id: userId, email: request.email, display_name: null })
      .select()
      .single();
    if (!insertError) userData = newUser;
  }

  if (!userData) throw new Error('Failed to get user profile');

  // Get or create character
  let { data: characterData } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!characterData) {
    const { data: newChar, error: charError } = await supabase
      .from('characters')
      .insert({
        user_id: userId,
        name: DEFAULT_CHARACTER_NAME,
        xp: 0,
        level: 1,
        stage: DEFAULT_CHARACTER_STAGE,
      })
      .select()
      .single();
    if (!charError) characterData = newChar;
  }

  if (!characterData) throw new Error('Failed to get character');

  return { user: userData as User, character: characterData as Character };
}

/**
 * Sign up new user and create profile + character
 * Note: Supabase trigger automatically creates user profile on auth.users insert
 */
export async function signUp(request: SignUpRequest): Promise<SignUpResponse> {
  console.log('[authService] signUp started with email:', request.email);

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: request.email,
    password: request.password,
  });

  console.log('[authService] auth.signUp result:', {
    userId: authData?.user?.id,
    authError: authError?.message,
    identities: authData?.user?.identities?.length
  });

  if (authError) {
    console.log('[authService] Auth error FULL:', JSON.stringify(authError, null, 2));
    console.log('[authService] Auth error message:', authError.message);
    console.log('[authService] Auth error code:', authError.code);
    console.log('[authService] Auth error status:', authError.status);
    throw authError;
  }
  if (!authData.user) throw new Error('Failed to create user');

  // Check if user already exists (identities will be empty for existing user)
  const isExistingUser = authData.user.identities && authData.user.identities.length === 0;
  if (isExistingUser) {
    console.log('[authService] User already exists, signing in instead...');
    // User already exists, try to sign in
    return signInAndSetup(request);
  }

  // 2. Sign in immediately after signup to ensure valid session
  console.log('[authService] Signing in after signup...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (signInError) {
    console.log('[authService] SignIn after signup failed:', signInError.message);
    // If sign in fails (maybe email not confirmed), use the original auth data
  }

  const userId = authData.user.id;

  // 2. Wait for trigger-created user profile, or create if not exists
  console.log('[authService] Checking for existing user profile...');
  let userData = await waitForRecord<User>(() =>
    supabase.from('users').select('*').eq('id', userId).single()
  );
  console.log('[authService] waitForRecord result:', userData ? 'found' : 'not found');

  if (!userData) {
    // Trigger didn't create it, create manually
    console.log('[authService] Creating user profile manually...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: request.email,
        display_name: request.displayName || null,
      })
      .select()
      .single();

    console.log('[authService] Insert user result:', {
      success: !!newUser,
      error: createError?.message,
      errorCode: createError?.code
    });

    if (createError) {
      // One more try to fetch (race condition)
      console.log('[authService] Insert failed, trying to fetch again...');
      const { data: fetchedUser } = await supabase
        .from('users').select('*').eq('id', userId).single();
      userData = fetchedUser as User;
    } else {
      userData = newUser as User;
    }
  }

  if (!userData) {
    console.log('[authService] FATAL: Could not get user profile after all attempts');
    throw new Error('Failed to get user profile');
  }
  console.log('[authService] User profile ready:', userData.id);

  // 3. Wait for trigger-created character, or create if not exists
  console.log('[authService] Checking for existing character...');
  let characterData = await waitForRecord<Character>(() =>
    supabase.from('characters').select('*').eq('user_id', userId).single()
  );
  console.log('[authService] Character waitForRecord result:', characterData ? 'found' : 'not found');

  if (!characterData) {
    // Trigger didn't create it, create manually
    console.log('[authService] Creating character manually...');
    const { data: newChar, error: charError } = await supabase
      .from('characters')
      .insert({
        user_id: userId,
        name: DEFAULT_CHARACTER_NAME,
        xp: 0,
        level: 1,
        stage: DEFAULT_CHARACTER_STAGE,
      })
      .select()
      .single();

    console.log('[authService] Insert character result:', {
      success: !!newChar,
      error: charError?.message,
      errorCode: charError?.code
    });

    if (charError) {
      // One more try to fetch
      console.log('[authService] Character insert failed, trying to fetch again...');
      const { data: fetchedChar } = await supabase
        .from('characters').select('*').eq('user_id', userId).single();
      characterData = fetchedChar as Character;
    } else {
      characterData = newChar as Character;
    }
  }

  if (!characterData) throw new Error('Failed to get character');
  console.log('[authService] Character ready:', characterData.id);

  // 4. Create initial daily state (only if not exists)
  const { data: existingState } = await supabase
    .from('daily_states')
    .select('*')
    .eq('user_id', userId)
    .eq('date', getTodayDate())
    .single();

  if (!existingState) {
    await supabase.from('daily_states').insert({
      user_id: userId,
      date: getTodayDate(),
      state: 'before_check',
    });
  }

  return {
    user: userData,
    character: characterData,
  };
}

/**
 * Sign in existing user
 */
export async function signIn(request: SignInRequest): Promise<SignInResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to sign in');

  // Fetch user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError) throw userError;

  return {
    user: userData as User,
  };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) return null;
  return data as User;
}
