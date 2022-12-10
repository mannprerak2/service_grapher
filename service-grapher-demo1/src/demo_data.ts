
const data = {
    name: "Service grapher demo 1",
    nodes: [
        {
            label: "Frontend",
            tags: ["P0"]
        },
        {
            label: "API Gateway",
            tags: ["P0"]
        },
        {
            label: "Backend",
            tags: ["P0"]
        },
        {
            label: "Logging Service",
            tags: ["P1"]
        },
        {
            label: "Database",
            tags: ["P0"]
        },
    ],
    links: [
        { source: 'frontend', target: 'api gateway' },
        { source: 'api gateway', target: 'backend' },
        { source: 'backend', target: 'database' },
        { source: 'backend', target: 'logging service' },
    ],
    more: [
        {
            name: "More links",
            url: "https://some-dummy-url.com/which/can-fetch?the=data"
        }
    ]
}

export { data };
