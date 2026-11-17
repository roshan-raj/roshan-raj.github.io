// Data for the skills graph in the About section.
//
// Projects are NOT listed here: they come from data/projects.js. Any entry in a
// project's "technologies" that matches a skill name below becomes a link, so a
// new project shows up in the graph on its own.
window.SKILL_GRAPH = {
    // Every skill that can appear as a dot. Names must match projects.js exactly.
    skills: [
        'TypeScript', 'Node.js', 'JavaScript', 'Python', 'SQL', 'C++',
        'Lambda', 'EventBridge', 'SQS', 'DynamoDB', 'S3', 'EC2', 'Athena', 'Cognito',
        'AWS CDK', 'SST',
        'Neo4j', 'MongoDB',
        'Effect-TS', 'Next.js', 'MCP', 'pandas', 'Blockchain'
    ],

    // Ways of building, each linked to the skills that belong to it
    concepts: {
        'Serverless': ['Lambda', 'DynamoDB', 'EventBridge', 'SQS', 'S3', 'Athena', 'Cognito'],
        'Event-driven': ['EventBridge', 'SQS', 'Lambda'],
        'Graph modelling': ['Neo4j'],
        'Infrastructure as code': ['AWS CDK', 'SST']
    },

    // Jobs, each linked to the skills used there
    roles: {
        'Technical Engineer': {
            period: '2023 – now',
            skills: ['TypeScript', 'Node.js', 'AWS CDK', 'SST', 'EventBridge', 'SQS', 'Lambda', 'Neo4j', 'SQL', 'Effect-TS']
        },
        'Software Engineer': {
            period: '2019 – 2023',
            skills: ['Node.js', 'JavaScript', 'MongoDB', 'Lambda', 'EC2', 'S3', 'Athena']
        }
    },

    // Per-project tweaks, keyed by the project's title in projects.js
    projects: {
        // Links to add when a project's tags don't name the skill directly
        extraSkills: {
            'Shop Management System': ['SQL']
        },
        // Projects to leave out of the graph
        exclude: ['Weather Application']
    }
};
