/** Accept project URLs and the REST base commonly copied from the API panel. */
export function normalizeSupabaseUrl(value) {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Supabase requires a project HTTPS URL.');
  }
  const path = url.pathname.replace(/\/+$/, '');
  if (path !== '' && path !== '/rest/v1') {
    throw new Error('Use the Supabase project URL, without an API endpoint path.');
  }
  return url.origin;
}

export function signInErrorMessage(error) {
  if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
    return 'Не удалось войти: неверный email или пароль.';
  }
  if (error.code === 'email_not_confirmed') return 'Не удалось войти: email аккаунта ещё не подтверждён.';
  if (error.status === 429) return 'Слишком много попыток входа. Подожди немного и попробуй снова.';
  if (!error.status || error.name === 'AuthRetryableFetchError') return 'Нет соединения с Supabase. Проверь подключение и попробуй снова. Пароль менять не нужно.';
  return 'Сервис входа Supabase недоступен. Требуется проверить подключение и настройки сайта.';
}
