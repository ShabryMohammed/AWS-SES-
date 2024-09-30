import SNS from 'aws-sdk/clients/sns.js';

const sns = new SNS();
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const sendEmail = async (event) => {
    for (const record of event.Records) {
        const messageBody = JSON.parse(record.body);
        const { productName, Quantity, price, shippingAddress } = messageBody;

        const emailContent = `
            Thank you for your purchase!
            Product: ${productName}
            Quantity: ${Quantity}
            Price: $${price}
            Shipping Address: ${shippingAddress}
        `;

            await sns.publish({
                TopicArn: SNS_TOPIC_ARN,
                Message: emailContent,
                Subject: `Purchase Confirmation for ${productName}`,
            }).promise();
    }
};
