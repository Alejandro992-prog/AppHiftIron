/**
 * HIFT IRON BOX - WEEK & CALENDAR MANAGER UTILITY
 * 
 * Gestiona la programación por semanas independientes (fechas reales de lunes a domingo).
 * Permite a los coaches programar semanas futuras, revisar semanas pasadas y clonar semanas.
 */

// Obtiene el lunes de la semana para una fecha dada
export function getMonday(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // 0 es domingo, 1 es lunes...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ajustar si es domingo
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Genera la clave de semana única basada en el lunes: "YYYY-MM-DD"
export function getWeekKey(d = new Date()) {
  const monday = getMonday(d);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Desplaza una clave de semana N semanas adelante o atrás
export function shiftWeekKey(weekKey, offsetWeeks = 1) {
  const [year, month, day] = weekKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + (offsetWeeks * 7));
  return getWeekKey(date);
}

// Comprueba si una clave de semana es la semana actual
export function isCurrentWeek(weekKey) {
  return weekKey === getWeekKey(new Date());
}

// Devuelve los 7 días (Lunes a Domingo) de la semana con fechas reales
export function getWeekDays(weekKey) {
  const [year, month, day] = weekKey.split('-').map(Number);
  const monday = new Date(year, month - 1, day);

  const dayIds = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const fullLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const monthsShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dayIds.map((id, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);

    const isToday = d.getTime() === today.getTime();

    return {
      id,
      index,
      label: labels[index],
      fullLabel: fullLabels[index],
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      monthName: monthsShort[d.getMonth()],
      dateStr: `${d.getDate()} ${monthsShort[d.getMonth()]}`,
      fullDateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      isToday
    };
  });
}

// Formatea el rango de la semana para títulos: "28 Sep - 4 Oct 2026"
export function formatWeekRange(weekKey) {
  const days = getWeekDays(weekKey);
  const first = days[0];
  const last = days[6];
  return `${first.dateStr} - ${last.dateStr} ${weekKey.split('-')[0]}`;
}
