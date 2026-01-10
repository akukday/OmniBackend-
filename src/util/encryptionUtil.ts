import bcrypt from "bcryptjs";
/**
 * bcrypt the provided string 
 * @param str 
 */
export function hashString(str?: string): string {
    return str ? bcrypt.hashSync(str, Number(process.env.SALT_CYCLE)) : "";
}
