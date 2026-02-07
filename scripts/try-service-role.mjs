import { IAMClient, AttachUserPolicyCommand } from "@aws-sdk/client-iam";

const client = new IAMClient({
    region: "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const command = new AttachUserPolicyCommand({
            UserName: "workwiselabs",
            PolicyArn: "arn:aws:iam::aws:policy/AmazonRoute53FullAccess",
        });
        console.log("Attempting to attach Route53 policy...");
        await client.send(command);
        console.log("Success! Policy attached.");
    } catch (err) {
        console.error("IAM Error:", err.message);
        process.exit(1);
    }
}

run();
