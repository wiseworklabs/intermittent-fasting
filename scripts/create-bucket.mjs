import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const command = new CreateBucketCommand({
            Bucket: "wiseworklabs",
        });
        console.log("Creating bucket 'wiseworklabs'...");
        await client.send(command);
        console.log("Success! Bucket created.");
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou') {
            console.log("Bucket already exists and is owned by you.");
        } else {
            console.error("Error creating bucket:", err.message);
            process.exit(1);
        }
    }
}

run();
