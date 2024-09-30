import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import SQS from 'aws-sdk/clients/sqs.js';

const docClient = new DynamoDB.DocumentClient();
const sqs = new SQS();

const SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/677276086672/MyQueue';

export const purchaseProduct = async (event) => {
    try {
        const { productName, Quantity, price, shippingAddress } = JSON.parse(event.body);

        // Validate input
        if (!productName || !Quantity || !price || !shippingAddress) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' }),
            };
        }

        // Add to DynamoDB
        const dynamoDBItem = {
            id: nanoid(8),
            productName,
            Quantity,
            price,
            shippingAddress,
        };
        await docClient.put({ TableName: 'Products', Item: dynamoDBItem }).promise();

        // Send message to SQS
        const sqsMessage = {
            id: nanoid(8),
            productName,
            Quantity,
            price,
            shippingAddress,
        };
        try {
            const sendMessageResult = await sqs.sendMessage({
                QueueUrl: SQS_QUEUE_URL,
                MessageBody: JSON.stringify(sqsMessage),
            }).promise();
            
            console.log("SQS sendMessage result:", sendMessageResult);
        } catch (error) {
            console.error("Error sending message to SQS:", error);  // Log any error details
            throw new Error('Error sending message to SQS');
        }

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Product added successfully, email sending in progress.' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating product', error: error.message }),
        };
    }
};
