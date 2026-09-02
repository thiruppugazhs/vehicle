export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    platform: 'FleetPulse Fleet & Vehicle Platform',
    backend: 'Supabase PostgreSQL + Vercel Edge',
    environment: process.env.NODE_ENV || 'production'
  });
}
