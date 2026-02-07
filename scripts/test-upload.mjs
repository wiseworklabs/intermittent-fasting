import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Credentials from info.md
const REGION = "ap-northeast-1";
const BUCKET = "wiseworklabs";
const KEY = "test/hello.txt";
const BODY = "Hello from Antigravity Verification!";

const client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: KEY,
            Body: BODY,
            ContentType: "text/plain",
        });

        console.log(`Uploading to s3://${BUCKET}/${KEY}...`);
        const response = await client.send(command);
        console.log("Upload Success!", response);
    } catch (err) {
        console.error("Upload Error:", err);
        process.exit(1);
    }
}

run();
