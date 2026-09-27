'use strict';
// Lab infrastructure: the standard spec reporter plus a score summary,
// styled after the assessment's "Test Cases" panel.
// This file is not part of the exercise. Do not modify it.
const Mocha = require('mocha');

const { EVENT_RUN_END } = Mocha.Runner.constants;

class ScoreReporter extends Mocha.reporters.Spec {
  constructor(runner, options) {
    super(runner, options);

    runner.once(EVENT_RUN_END, () => {
      const stats = runner.stats;
      const total = stats.passes + stats.failures;
      if (total === 0) {
        return;
      }
      const pct = Math.round((stats.passes / total) * 100);
      const width = 24;
      const filled = Math.round((stats.passes / total) * width);
      const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
      const line = '─'.repeat(52);

      const FULL_SUITE = 12;
      console.log(`  ${line}`);
      console.log(`   Test Cases: ${total} ran, ${stats.passes} passed, ${stats.failures} failed`);
      console.log(`   Score: ${stats.passes}/${total} (${pct}%)  ${bar}`);
      if (total < FULL_SUITE) {
        console.log("   Subset run — run the full suite (npm test) for your real score.");
      } else if (pct === 100) {
        console.log('   All predefined unit tests passing. Ready to submit! 🎉');
      } else if (pct >= 75) {
        console.log('   Almost there — this is already a strong result. Keep pushing!');
      } else if (pct >= 50) {
        console.log('   Over halfway. Keep going!');
      } else {
        console.log('   Every fixed test counts — partial credit is real. Keep at it.');
      }
      console.log(`  ${line}`);
    });
  }
}

module.exports = ScoreReporter;
