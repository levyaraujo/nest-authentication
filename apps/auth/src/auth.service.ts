import { Injectable } from '@nestjs/common';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  getHello(): string {
    return 'Hello World!';
  }

  static async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;
    const hash = `${buff.toString('hex')}.${salt}`
    console.log(hash);
    return hash;
  }

  static async comparePassword(
    hash: string,
    plain: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = hash.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(plain, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }
}
