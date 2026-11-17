// Edit this list to add, remove or reorder projects on the site.
//
// Every project needs: title, problem (one line), technologies, githubUrl.
//
// featured: true gives a project a full card. Those also use:
//   learned     one line on what you took away from it
//   diagram     a short list of steps, drawn as a small flow at the top of the card
//   image       optional path to a screenshot, shown instead of the diagram
//   writeupUrl  optional link to an article about it
//
// Projects without featured: true are listed compactly under "More projects".
// The skills graph (data/graph.js) reads title and technologies from here too.
window.PROJECTS = [
    {
        "title": "SquadFit",
        "featured": true,
        "problem": "Fitness trackers are built for one person, but habits stick better with friends. SquadFit gives a friend group shared workouts, meal logs, streaks and a leaderboard.",
        "learned": "Adding an MCP server taught me to treat an AI assistant as one more API client: same auth, same validation, no special trust.",
        "diagram": ["Web app or AI assistant", "Cognito", "Lambda", "DynamoDB"],
        "technologies": [
            "TypeScript",
            "Next.js",
            "AWS CDK",
            "Lambda",
            "DynamoDB",
            "Cognito",
            "MCP"
        ],
        "githubUrl": "https://github.com/TacticalHacker/calci"
    },
    {
        "title": "Social Media Tourism",
        "featured": true,
        "problem": "An aviation company was cold-calling customers. This predicts which social-network users are likely to buy a ticket, so ads go only to them.",
        "learned": "Laptop and mobile users behaved differently enough to need separate models. One blended model hid both patterns.",
        "diagram": ["User activity", "Analysis", "Two models", "Ad audience"],
        "technologies": [
            "Python",
            "pandas",
            "Jupyter",
            "EDA",
            "Predictive Modelling"
        ],
        "githubUrl": "https://github.com/roshan-raj/social-media-tourism"
    },
    {
        "title": "Blockchain Visualization",
        "featured": true,
        "problem": "Proof-of-work is hard to picture from text alone. This computer-graphics project animates how a block is mined and added to the chain.",
        "learned": "Drawing each step is a higher bar than describing it. I had to understand hashing and mining well enough to animate them.",
        "diagram": ["Transaction", "Block", "Proof of work", "Chain"],
        "technologies": [
            "C++",
            "Computer Graphics",
            "Blockchain"
        ],
        "githubUrl": "https://github.com/roshan-raj/Computer-Graphic-Project-on-working-of-Blockchain"
    },
    {
        "title": "NodeJS Blockchain",
        "problem": "A small blockchain with proof-of-work, written to understand the fundamentals by building them.",
        "technologies": [
            "JavaScript",
            "Node.js",
            "Blockchain"
        ],
        "githubUrl": "https://github.com/roshan-raj/NodeJS-BlockChain"
    },
    {
        "title": "Shop Management System",
        "problem": "Lets shopkeepers list products and customers buy them, with home delivery or in-store pickup.",
        "technologies": [
            "Full Stack",
            "SQL",
            "E-commerce"
        ],
        "githubUrl": "https://github.com/roshan-raj/Shop-Management-System"
    },
    {
        "title": "Weather Application",
        "problem": "A simple command-line tool that shows current weather for a location, using the OpenWeatherMap API.",
        "technologies": [
            "JavaScript",
            "CLI",
            "OpenWeatherMap"
        ],
        "githubUrl": "https://github.com/roshan-raj"
    }
];
