import { Route53Client, ListHostedZonesCommand } from "@aws-sdk/client-route-53";

const client = new Route53Client({
    region: "mx-central-1", // Global service, region doesn't matter much but good to be explicit
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const command = new ListHostedZonesCommand({});
        const response = await client.send(command);
        console.log("Hosted Zones:", response.HostedZones?.length || 0);
        response.HostedZones?.forEach(zone => {
            console.log(`- ${zone.Name} (${zone.Id})`);
        });
    } catch (err) {
        console.error("Error listing zones:", err.message);
        process.exit(1);
    }
}

run();
