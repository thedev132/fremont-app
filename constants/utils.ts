export function stripAfterAtSymbol(inputString) {
    return inputString.split('@')[0];
}

export function isDateInRange(startDate: string, endDate: string, checkDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const check = new Date(checkDate);
  
    return check >= start && check <= end;
}