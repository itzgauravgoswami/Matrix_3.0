/**
 * Format date to dd/mm/yyyy format
 * @param {Date | string} date - Date object or date string
 * @returns {string} Formatted date in dd/mm/yyyy format
 */
export const formatDateToDDMMYYYY = (date) => {
  if (!date) return ''; 
  
  const d = new Date(date); 
  const day = String(d.getDate()).padStart(2, '0'); 
  const month = String(d.getMonth() + 1).padStart(2, '0'); 
  const year = d.getFullYear(); 
  
  return `${day}/${month}/${year}`; 
}; 

/**
 * Format date using locale (fallback method)
 * @param {Date | string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return ''; 
  
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }); 
}; 

export default formatDateToDDMMYYYY; 

