const uuid = require('uuid');

class StringUtil {
    constructor() {}

    public static checkUUID(str: string) {
        try {
            uuid.parse(str);
            return true;
          } catch (error) {
            return false;
          }
    }
    
    public static extractNameFromEmail(email) {
      if (!email || !email.includes('@')) return null;
    
      const username = email.split('@')[0];
      const parts = username.split(/[._-]/); // split on common separators
      const capitalized = parts.map(
        part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      );
    
      return capitalized.join(' ');
    }
}

export { StringUtil };

