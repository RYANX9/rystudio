import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request:NextRequest){const response=NextResponse.next();response.headers.set('Access-Control-Allow-Origin',process.env.ALLOWED_ORIGIN||'*');response.headers.set('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type');if(request.method==='OPTIONS')return new NextResponse(null,{status:204,headers:response.headers});return response;}
export const config={matcher:'/api/:path*'};