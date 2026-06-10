"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FacebookOAuthButton } from "@/components/facebook-oauth/FacebookOAuthButton";
import { FacebookDashboard } from "@/components/facebook-oauth/FacebookDashboard";
import { RoleGuard } from "@/components/RoleGuard";

export default function FacebookAuthPage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin']} allowedPlans={['pro', 'enterprise']}>
      <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] z-10 overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
          <div className="flex items-center gap-4 p-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[8px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
              onClick={() => router.push('/integrations')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Facebook OAuth</h1>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
                Connect your Facebook accounts to manage pages and services.
              </p>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <FacebookOAuthButton
              onConnect={() => {
                window.location.reload();
              }}
            />
            <FacebookDashboard />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
