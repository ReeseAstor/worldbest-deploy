'use client';

import { useState } from 'react';
import { 
  FEATURE_FLAGS, 
  FeatureFlagKey, 
  getFlagMetadata 
} from '@/lib/feature-flags';
import { useFeatureFlags } from '@/lib/feature-flags/provider';
import { AlertCircle, CheckCircle2, Copy, Flag, Info, XCircle } from 'lucide-react';

export default function FeatureFlagsAdminPage() {
  const [copiedEnvVar, setCopiedEnvVar] = useState<string | null>(null);
  const flags = useFeatureFlags();
  const flagMetadata = getFlagMetadata();

  const handleCopyEnvVar = async (envVarName: string, value: boolean) => {
    const envString = `${envVarName}=${value}`;
    await navigator.clipboard.writeText(envString);
    setCopiedEnvVar(envVarName);
    setTimeout(() => setCopiedEnvVar(null), 2000);
  };

  const getEffectiveStatus = (
    flagKey: FeatureFlagKey, 
    defaultValue: boolean, 
    envOverride: boolean | null
  ): { enabled: boolean; source: 'env' | 'default' } => {
    if (envOverride !== null) {
      return { enabled: envOverride, source: 'env' };
    }
    return { enabled: flags[flagKey] ?? defaultValue, source: 'default' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Flag className="h-6 w-6 text-amber-700" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900">Feature Flags</h1>
          </div>
          <p className="text-stone-600 ml-14">
            Manage feature rollouts and experimental features for Ember
          </p>
        </div>

        {/* Info Callout */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Environment-Based Configuration</h3>
              <p className="text-blue-800 text-sm mt-1">
                Feature flags are controlled via environment variables. Set{' '}
                <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono text-xs">
                  NEXT_PUBLIC_FF_&#123;FLAG_KEY&#125;=true|false
                </code>{' '}
                to override default values. Changes require a rebuild to take effect.
              </p>
            </div>
          </div>
        </div>

        {/* Flags Table */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left py-4 px-6 font-semibold text-stone-700 text-sm">
                    Flag Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-stone-700 text-sm">
                    Description
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-stone-700 text-sm">
                    Default
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-stone-700 text-sm">
                    Env Override
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-stone-700 text-sm">
                    Effective Status
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-stone-700 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {flagMetadata.map((flag, index) => {
                  const { enabled, source } = getEffectiveStatus(
                    flag.name, 
                    flag.defaultValue, 
                    flag.envOverride
                  );
                  
                  return (
                    <tr 
                      key={flag.key}
                      className={`border-b border-stone-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                      } hover:bg-amber-50/50 transition-colors`}
                    >
                      {/* Flag Name */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-medium text-stone-900">
                            {flag.name}
                          </span>
                          <span className="font-mono text-xs text-stone-500 mt-0.5">
                            {flag.envVarName}
                          </span>
                        </div>
                      </td>
                      
                      {/* Description */}
                      <td className="py-4 px-6">
                        <span className="text-sm text-stone-600">
                          {flag.description}
                        </span>
                      </td>
                      
                      {/* Default Value */}
                      <td className="py-4 px-6 text-center">
                        <span 
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            flag.defaultValue 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {flag.defaultValue ? 'true' : 'false'}
                        </span>
                      </td>
                      
                      {/* Env Override */}
                      <td className="py-4 px-6 text-center">
                        {flag.envOverride !== null ? (
                          <span 
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              flag.envOverride 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {flag.envOverride ? 'true' : 'false'}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-sm">—</span>
                        )}
                      </td>
                      
                      {/* Effective Status */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {enabled ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-stone-400" />
                          )}
                          <span 
                            className={`font-medium text-sm ${
                              enabled ? 'text-emerald-600' : 'text-stone-500'
                            }`}
                          >
                            {enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          {source === 'env' && (
                            <span className="text-xs text-blue-600 ml-1">(env)</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyEnvVar(flag.envVarName, true)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                            title={`Copy ${flag.envVarName}=true`}
                          >
                            {copiedEnvVar === flag.envVarName ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Enable
                          </button>
                          <button
                            onClick={() => handleCopyEnvVar(flag.envVarName, false)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded transition-colors"
                            title={`Copy ${flag.envVarName}=false`}
                          >
                            {copiedEnvVar === flag.envVarName ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-2xl font-bold text-stone-900">
              {Object.keys(FEATURE_FLAGS).length}
            </div>
            <div className="text-sm text-stone-600">Total Flags</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">
              {Object.values(flags).filter(Boolean).length}
            </div>
            <div className="text-sm text-stone-600">Currently Enabled</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-2xl font-bold text-stone-500">
              {Object.values(flags).filter(v => !v).length}
            </div>
            <div className="text-sm text-stone-600">Currently Disabled</div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-stone-900 rounded-xl p-6 text-stone-100">
          <h3 className="text-lg font-semibold mb-4">Usage in Code</h3>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <p className="text-stone-400 mb-2">{/* Using the hook */}Using the hook:</p>
              <pre className="text-amber-400">
{`const isEnabled = useFeatureFlag('STRIPE_PAYMENTS');`}
              </pre>
            </div>
            <div>
              <p className="text-stone-400 mb-2">{/* Using the FeatureGate component */}Using the FeatureGate component:</p>
              <pre className="text-amber-400">
{`<FeatureGate flag="STRIPE_PAYMENTS" fallback={<ComingSoon />}>
  <PricingSection />
</FeatureGate>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
