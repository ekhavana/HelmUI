import { Bot, Send, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { runtimeConfig } from '../../config/runtime';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

function assistantReply(input: string, context: ReturnType<typeof buildContext>): string {
  const text = input.toLowerCase();

  if (text.includes('engine')) {
    if (context.engineRpm == null) return 'Engine data is not available yet.';
    return `Engine is at ${Math.round(context.engineRpm)} RPM, coolant ${formatNumber(context.coolant)} C, oil ${formatNumber(context.oil)} psi.`;
  }
  if (text.includes('anchor')) {
    return `Anchor watch reports ${formatNumber(context.anchorDistance)} m offset inside a ${formatNumber(context.anchorRadius)} m radius.`;
  }
  if (text.includes('route') || text.includes('eta')) {
    return `Next waypoint is ${context.waypoint}, ${formatNumber(context.distance)} nm away, ETA ~${context.etaMinutes} min.`;
  }
  return 'Acknowledged. I can summarize route, engine, anchor watch, and system health. I never replace helm safety decisions.';
}

function buildContext(data: ReturnType<typeof useBoatStore.getState>['data']) {
  return {
    engineRpm: data.engine.rpm,
    coolant: data.engine.coolantTempC,
    oil: data.engine.oilPressurePsi,
    anchorDistance: data.anchor.distanceFromSetMeters,
    anchorRadius: data.anchor.radiusMeters,
    waypoint: data.route.nextWaypoint,
    distance: data.route.distanceNm,
    etaMinutes: data.route.etaMinutes,
  };
}

export function AiAssistantScreen() {
  const data = useBoatStore((state) => state.data);
  const messages = useBoatStore((state) => state.aiMessages);
  const addAiMessage = useBoatStore((state) => state.addAiMessage);
  const clearAiMessages = useBoatStore((state) => state.clearAiMessages);
  const [input, setInput] = useState('');
  const context = useMemo(() => buildContext(data), [data]);

  const sendMessage = (text: string) => {
    if (!runtimeConfig.ai.enabled) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    addAiMessage({ role: 'user', text: trimmed });
    addAiMessage({ role: 'assistant', text: assistantReply(trimmed, context) });
    setInput('');
  };

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px] gap-4">
      <Card className="flex min-h-0 flex-col rounded-[2rem]" title="AI Assistant" eyebrow="Optional Co-Pilot" tone="active">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Bot className="h-5 w-5" />
          Context-aware, local-first guidance pane
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-semibold ${message.role === 'assistant' ? 'bg-cyan-950/45 text-cyan-100' : 'ml-auto bg-slate-800 text-slate-100'}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-600 bg-slate-950/65 px-4 py-3 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-300/60"
            disabled={!runtimeConfig.ai.enabled}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage(input);
            }}
            placeholder="Ask: route ETA, engine status, anchor drift..."
            value={input}
          />
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!runtimeConfig.ai.enabled}
            onClick={() => sendMessage(input)}
            type="button"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
        {!runtimeConfig.ai.enabled ? <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">AI Assistant is disabled in production profile.</div> : null}
      </Card>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Quick Prompts" eyebrow="One Tap">
          <div className="grid gap-2">
            {['Summarize engine status', 'How is anchor watch?', 'Give route update', 'Systems health report'].map((prompt) => (
              <button
                key={prompt}
                className="rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-left text-sm font-semibold text-slate-200 transition hover:border-cyan-300/45 hover:text-cyan-100"
                onClick={() => sendMessage(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
          <button
            className="mt-3 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/45 hover:text-cyan-100"
            onClick={clearAiMessages}
            type="button"
          >
            Clear chat history
          </button>
        </Card>
        <Card title="Safety Guardrail" eyebrow="Non-Blocking" tone="warning">
          <div className="flex items-start gap-3 text-sm font-semibold text-amber-100">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            Assistant suggestions are advisory only. Helm controls and alarms remain primary.
          </div>
        </Card>
        <Card title="Live Context" eyebrow="Current Snapshot">
          <div className="space-y-2 text-sm font-semibold text-slate-200">
            <div>Heading {formatDegrees(data.navigation.headingTrue)}</div>
            <div>SOG {formatNumber(data.speed.sogKts)} kt</div>
            <div>Closest AIS {formatNumber(data.ais.closestNm)} nm</div>
            <div>House battery {formatNumber(data.battery.housePercent)}%</div>
          </div>
        </Card>
      </aside>
    </section>
  );
}
