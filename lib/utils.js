import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (INR)
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR') {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₹0.00';
  }
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - Format type: 'short', 'long', 'full' (default: 'short')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  switch (format) {
    case 'long':
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    
    case 'full':
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    
    case 'short':
    default:
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
  }
}
