const ERROR_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'Correo o contraseña incorrectos',
  'User not found': 'Usuario no encontrado',
  'Not authenticated': 'Sesión no válida',
  'Could not validate credentials': 'No se pudieron validar las credenciales',
};

export function translateApiError(message: string): string {
  const trimmed = message.trim();
  if (ERROR_TRANSLATIONS[trimmed]) return ERROR_TRANSLATIONS[trimmed];

  const lower = trimmed.toLowerCase();
  if (lower.includes('invalid credentials') || lower.includes('incorrect password')) {
    return 'Correo o contraseña incorrectos';
  }
  if (lower.includes('user not found') || lower.includes('no user')) {
    return 'Usuario no encontrado';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté en marcha.';
  }

  return trimmed;
}
