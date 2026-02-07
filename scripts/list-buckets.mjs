import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const command = new ListBucketsCommand({});
        const response = await client.send(command);
        console.log("Buckets:", response.Buckets?.length || 0);
        response.Buckets?.forEach(b => {
            console.log(`- ${b.Name}`);
        });
    } catch (err) {
        console.error("Error listing buckets:", err.message);
        process.exit(1);
    }
}

run();
