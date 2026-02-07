import { Route53Client, CreateHostedZoneCommand, ChangeResourceRecordSetsCommand, ListHostedZonesByNameCommand, GetHostedZoneCommand } from "@aws-sdk/client-route-53";

const DOMAIN = "wiseworklabs.com";
const SUBDOMAIN = "intermittent-fasting";
const VERCEL_IP = "76.76.21.21";

const client = new Route53Client({
    region: "mx-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        // 1. Check if Hosted Zone Exists
        let hostedZoneId;
        const listCmd = new ListHostedZonesByNameCommand({ DNSName: DOMAIN });
        const listRes = await client.send(listCmd);
        const existingZone = listRes.HostedZones?.find(z => z.Name === `${DOMAIN}.`);

        if (existingZone) {
            console.log(`Hosted Zone for ${DOMAIN} already exists: ${existingZone.Id}`);
            hostedZoneId = existingZone.Id;
        } else {
            console.log(`Creating new Hosted Zone for ${DOMAIN}...`);
            const createCmd = new CreateHostedZoneCommand({
                Name: DOMAIN,
                CallerReference: `${Date.now()}`, // Unique string
            });
            const createRes = await client.send(createCmd);
            hostedZoneId = createRes.HostedZone.Id;
            console.log(`Created Hosted Zone: ${hostedZoneId}`);
        }

        // 2. Get Name Servers
        const getZoneCmd = new GetHostedZoneCommand({ Id: hostedZoneId });
        const getZoneRes = await client.send(getZoneCmd);
        console.log("\n*** IMPORTANT: UPDATE YOUR REGISTRAR (GABIA) ***");
        console.log("Name Servers:");
        getZoneRes.DelegationSet.NameServers.forEach(ns => console.log(`- ${ns}`));
        console.log("************************************************\n");

        // 3. Create A Record
        console.log(`Creating A Record for ${SUBDOMAIN}.${DOMAIN} -> ${VERCEL_IP}...`);
        const changeCmd = new ChangeResourceRecordSetsCommand({
            HostedZoneId: hostedZoneId,
            ChangeBatch: {
                Changes: [
                    {
                        Action: "UPSERT",
                        ResourceRecordSet: {
                            Name: `${SUBDOMAIN}.${DOMAIN}`,
                            Type: "A",
                            TTL: 300,
                            ResourceRecords: [{ Value: VERCEL_IP }],
                        },
                    },
                ],
            },
        });
        await client.send(changeCmd);
        console.log("DNS Record Created Successfully!");

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

run();
