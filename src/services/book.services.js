const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const pdf2json = require('pdf2json');
const pdfjsLib = require('pdfjs-dist');

const s3C = new S3Client(
    {
        region: 'us-west-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });


const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2'
});
const s3 = new AWS.S3();
const pdfParser = new pdf2json();
const PAGE_SIZE = 1024 * 1024 * 2; // 2 MB

async function getPageFromS3(bucketName, key, pageNumber) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Range: `bytes=${pageNumber * PAGE_SIZE}-${(pageNumber + 1) * PAGE_SIZE - 1}`,
    };
    const { Body } = await s3.getObject(params).promise();
    const data = new Uint8Array(Body);
    const pdfDocument = await pdfjsLib.getDocument(data).promise;
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };
    await page.render(renderContext).promise;
    return canvas.toDataURL();
}

exports.getBookbyPage = async (req, res) => {
    try {
        const { page, key } = req.params;
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key
        };
        const pageNumber = parseInt(page, 10) - 1;
        const dataURL = await getPageFromS3(params.Bucket, key, pageNumber);
        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(dataURL.split(',')[1], 'base64'));

    }
    catch (err) {
        console.log(err);
    }
};






exports.getBook = async (req, res) => {
    try {
        console.log(process.env.AWS_BUCKET);
        const { id } = req.params;
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: id
        };
        const command = new GetObjectCommand(params);
        const response = await s3C.send(command)
        res.setHeader('Content-Type', 'application/pdf');
        return streamToBuffer(response.Body)
    }
    catch (err) {
        console.log(err);
    }
};

const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
}