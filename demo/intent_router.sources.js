/**
 * @param {string} msg
 * @returns {string}
 */
const route_intent = (msg) => ((_m) => {
  if (_m === "quit") return "exit";
  if (_m === "exit") return "exit";
  if (_m === "bye") return "exit";
  const __li = $likely_best(_m, ["greeting hello hi hey", "help how do I docs documentation", "refund billing charge money back payment", "bug crash error broken not working", "pricing cost plan subscribe upgrade"], 0.28);
  if (__li === 0) return "greet";
  if (__li === 1) return "help";
  if (__li === 2) return "billing";
  if (__li === 3) return "bug";
  if (__li === 4) return "pricing";
  return "unknown";
})(msg);

/**
 * @param {string} intent
 * @returns {string}
 */
const route_label = (intent) => ((_m) => (_m === "exit") ? "Exit" : (_m === "greet") ? "Greeting" : (_m === "help") ? "Help / Docs" : (_m === "billing") ? "Billing / Refund" : (_m === "bug") ? "Bug Report" : (_m === "pricing") ? "Pricing" : "Unknown")(intent);

/**
 * @param {string} intent
 * @returns {string}
 */
const route_reply = (intent) => ((_m) => (_m === "exit") ? "Goodbye — session closed." : (_m === "greet") ? "Hey! What can I help you with today?" : (_m === "help") ? "Opening the docs — try the Quick Start section." : (_m === "billing") ? "Routing you to billing support for refunds and charges." : (_m === "bug") ? "Thanks for the report — filing a bug ticket." : (_m === "pricing") ? "Here are the current plans and upgrade options." : "I am not sure — try rephrasing, or say help.")(intent);

/**
 * @param {string} msg
 * @returns {__object__}
 */
const handle_message = (msg) => {
  let intent = route_intent(msg);
  return {intent, label: route_label(intent), reply: route_reply(intent)};
};

