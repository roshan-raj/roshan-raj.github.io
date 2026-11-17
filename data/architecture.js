// Content for the interactive architecture diagram.
// Edit the text here; js/architecture.js handles layout and animation.
//
// col / row place a node on the grid: the main flow runs along row 0,
// and row 1 holds the two side branches (drawn beside the flow on phones).
window.ARCHITECTURE = {
    nodes: [
        {
            id: 'producer', label: 'Producer', sub: 'any service', col: 0, row: 0,
            what: 'Any service with something to report: an order changed, a report finished. It publishes the fact and moves on.',
            why: 'Producers never call consumers directly, so adding a new integration doesn’t touch the ones already running.'
        },
        {
            id: 'bus', label: 'EventBridge', sub: 'event bus', col: 1, row: 0,
            what: 'The central bus. Every event lands here with a source, a type and a payload.',
            why: 'Managed routing with no brokers to run, and one place to see everything flowing through the system.'
        },
        {
            id: 'rule', label: 'Rule', sub: 'pattern match', col: 2, row: 0,
            what: 'Matches events against a pattern and forwards only what a consumer asked for.',
            why: 'Filtering at the bus means consumers aren’t invoked, or billed, for events they would throw away.'
        },
        {
            id: 'queue', label: 'SQS queue', sub: 'buffer + retry', col: 3, row: 0,
            what: 'Holds events until the consumer is ready, and redelivers them if processing fails.',
            why: 'A queue per consumer absorbs spikes and gives each one its own retry policy, so one slow service can’t back up the rest.'
        },
        {
            id: 'consumer', label: 'Lambda', sub: 'consumer', col: 4, row: 0,
            what: 'Reads a batch from the queue, checks whether it has seen each event before, then does the work.',
            why: 'Scales with queue depth and costs nothing when idle. Failures are reported per message, so one bad event doesn’t replay the whole batch.'
        },
        {
            id: 'graph', label: 'Neo4j', sub: 'graph store', col: 5, row: 0,
            what: 'The destination. Events become nodes and relationships in the graph model.',
            why: 'The questions asked of this data are about connections several hops deep. That is a pile of joins in SQL and a single traversal in a graph.'
        },
        {
            id: 'dlq', label: 'Dead-letter queue', sub: 'failed events', col: 3, row: 1,
            what: 'Catches messages that still fail after the retry limit, with the original payload intact.',
            why: 'A poison message shouldn’t block the queue or silently vanish. Parked here, it raises an alarm and can be replayed once the bug is fixed.'
        },
        {
            id: 'keys', label: 'DynamoDB', sub: 'idempotency keys', col: 4, row: 1,
            what: 'Stores one key per processed event, with an expiry. A conditional write tells the consumer whether this is a duplicate.',
            why: 'SQS delivers at least once, so duplicates are a certainty. A fast conditional write makes every handler safe to retry.'
        }
    ],

    edges: [
        { from: 'producer', to: 'bus' },
        { from: 'bus', to: 'rule' },
        { from: 'rule', to: 'queue' },
        { from: 'queue', to: 'consumer' },
        { from: 'consumer', to: 'graph' },
        { from: 'queue', to: 'dlq', branch: true },
        { from: 'consumer', to: 'keys', branch: true }
    ],

    // Each step moves the dot to a node and shows a line of narration.
    // fail: true marks the node as having failed at that step.
    runs: {
        success: [
            { to: 'producer', say: 'A service publishes an event.' },
            { to: 'bus', say: 'The event lands on the bus.' },
            { to: 'rule', say: 'A rule matches it to a consumer.' },
            { to: 'queue', say: 'It waits in that consumer’s queue.' },
            { to: 'consumer', say: 'Lambda picks it up.' },
            { to: 'keys', say: 'First time seeing this event? The key is written.' },
            { to: 'consumer', say: 'Not a duplicate, so the work goes ahead.' },
            { to: 'graph', say: 'Written to the graph. Done.' }
        ],
        failure: [
            { to: 'producer', say: 'A service publishes an event.' },
            { to: 'bus', say: 'The event lands on the bus.' },
            { to: 'rule', say: 'A rule matches it to a consumer.' },
            { to: 'queue', say: 'It waits in that consumer’s queue.' },
            { to: 'consumer', say: 'Lambda picks it up, and the handler throws.', fail: true },
            { to: 'queue', say: 'The message goes back to the queue.' },
            { to: 'consumer', say: 'Retry. It fails again.', fail: true },
            { to: 'queue', say: 'Retry limit reached.' },
            { to: 'dlq', say: 'Parked in the dead-letter queue. Nothing is lost, and nothing else is blocked.' }
        ]
    }
};
