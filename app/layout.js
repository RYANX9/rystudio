import './globals.css';

export const metadata={title:'Chronicle — Personal Time Intelligence',description:'Track, understand, and improve how you spend your day.',manifest:'/manifest.json',appleWebApp:{capable:true,statusBarStyle:'default',title:'Chronicle'}};
export const viewport={themeColor:'#ECEAE4',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}