import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import SES from 'aws-sdk/clients/ses.js';  

const docClient = new DynamoDB.DocumentClient();
const ses = new SES();

export const purchaseProduct = async (event) => {
    try {
        const { productName, Quantity, price, email, shippingAddress } = JSON.parse(event.body);

       
        if (!productName || !Quantity || !price || !email || !shippingAddress) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields',
                }),
            };
        }

        
        await docClient.put({
            TableName: 'Products',
            Item: {
                id: nanoid(8),
                productName,
                Quantity,
                email,
                price,
                shippingAddress,
            },
        }).promise();

        // Send a confirmation email using SES
        const emailParams = {
            Source: 'shabry967@gmail.com',  
            Destination: {
                ToAddresses: [email],  
            },
            Message: {
                Subject: {
                    Data: `Purchase Confirmation for ${productName}`,
                },
                Body: {
                    Html: {
                        Data: `
                            <h1>Thank you for your purchase!</h1>
                            <p>Hello,</p>
                            <p>We are pleased to confirm your purchase of <b>${Quantity} x ${productName}</b>.</p>
                            <p>Total: <b>$${price}</b></p>
                            <p>${shippingAddress}</p>
                            <p>Your order will be processed and shipped soon. Thank you for choosing us!</p>
                            <br/>
                            <p>Best regards,</p>
                            <p>Knightowl</p>
                        `,
                    },
                },
            },
        };

        
        await ses.sendEmail(emailParams).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Product added successfully and email sent' }),
        };
    } catch (error) {
        console.error('Error creating product or sending email:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error creating product or sending email. Please try again later.',
            }),
        };
    }
};
