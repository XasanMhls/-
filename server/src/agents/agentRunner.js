/**
 * Agent Runner
 * Bootstraps all autonomous background agents after the DB is ready.
 *
 * Each agent must export an object with:
 *   { name, intervalMs, run(): Promise<void> }
 *
 * Agents run once immediately on startup, then on their configured interval.
 * Errors inside an agent are caught and logged — they never crash the server.
 */
import { cleanupAgent }         from './cleanupAgent.js';
import { staleAgent }           from './staleAgent.js';
import { repeatAgent }          from './repeatAgent.js';
import { statsAgent }           from './statsAgent.js';
import { urgentEscalateAgent }  from './urgentEscalateAgent.js';
import { duplicateAgent }       from './duplicateAgent.js';

const AGENTS = [
  cleanupAgent,
  staleAgent,
  repeatAgent,
  statsAgent,
  urgentEscalateAgent,
  duplicateAgent,
];

function startAgent(agent) {
  const safeguard = async () => {
    try {
      await agent.run();
    } catch (err) {
      console.error(`[${agent.name}] Error:`, err.message);
    }
  };

  // Run once on startup (slight delay so the DB connection settles)
  setTimeout(safeguard, 5000);

  // Then run on interval
  setInterval(safeguard, agent.intervalMs);

  console.log(`[AgentRunner] ${agent.name} started (interval: ${Math.round(agent.intervalMs / 60000)}m)`);
}

export function startAllAgents() {
  console.log(`\x1b[35m🤖 Starting ${AGENTS.length} background agents...\x1b[0m`);
  for (const agent of AGENTS) {
    startAgent(agent);
  }
}
