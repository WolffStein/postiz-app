import { Organization } from '@prisma/client';

declare module 'express' {
  export interface Request {
    org?: Organization;
  }
}

