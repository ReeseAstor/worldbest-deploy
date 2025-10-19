#!/bin/bash

# Deploy to Vercel with environment variables
vercel --prod \
  -e POSTGRES_URL="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x" \
  -e POSTGRES_PRISMA_URL="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" \
  -e POSTGRES_URL_NON_POOLING="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" \
  -e SUPABASE_URL="https://tcwuhdgsizydhtbbgirw.supabase.co" \
  -e SUPABASE_JWT_SECRET="1kDrjWjBlOfinP/jHFb8Xa9zvu1JAAcmCPJxrOuxzyWgm3GxcdXIamOv46sNps6iocGH7R49XX2cpE6bw5j0dg==" \
  -e SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgwNDc1MCwiZXhwIjoyMDc2MzgwNzUwfQ.ULFqQa89WIT4wkQ4t8EtW3kqKpuK3TJjFsdFb7_p4F4" \
  -e NEXT_PUBLIC_SUPABASE_URL="https://tcwuhdgsizydhtbbgirw.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDQ3NTAsImV4cCI6MjA3NjM4MDc1MH0.VBCzSM0mDxwwhxvVT61pJ-wq7MyKqN2SyLfzek0HUaA"
