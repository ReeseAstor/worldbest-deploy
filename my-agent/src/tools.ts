// Simple tools without complex typing - will be used manually if needed
export const tools = [];

// Tool execution functions for manual use
export const executeCalculator = (expression: string) => {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
    const result = new Function(`return ${sanitized}`)();
    return { result: Number(result) };
  } catch {
    return { error: 'Invalid expression' };
  }
};

export const executeWeather = (location: string) => {
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
  const temp = Math.floor(Math.random() * 30) + 50;
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    location,
    temperature: `${temp}°F`,
    condition,
    humidity: `${Math.floor(Math.random() * 50) + 30}%`,
  };
};

export const executeDateTime = (timezone?: string) => {
  const now = new Date();
  const tz = timezone || 'UTC';
  
  return {
    formatted: now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz,
    }),
    timestamp: now.toISOString(),
    timezone: tz,
  };
};
