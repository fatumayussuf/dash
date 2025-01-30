import axios from "axios";

// Environment configuration
const isDevelopment = process.env.NODE_ENV === "development";
const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || "174379";
const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const callbackURL = process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/callback";
const mpesaAPIUrl = process.env.MPESA_API_URL || "https://sandbox.safaricom.co.ke";  // Change this for production

// Format phone number to E.164 format (Safaricom expects 2547XXXXXXXX)
const formatPhoneNumber = (phone: string): string => {
  if (!phone) {
    throw new Error("Phone number is required but missing.");
  }

  // Remove any non-numeric characters
  phone = phone.replace(/\D/g, "");

  // Convert 07XXXXXXXX to 2547XXXXXXXX
  if (phone.startsWith("07")) {
    phone = "254" + phone.substring(1);
  }

  // Ensure it starts with 2547 and is exactly 12 digits
  if (!phone.startsWith("2547") || phone.length !== 12) {
    throw new Error(`Invalid Phone Number Format: ${phone}`);
  }

  return phone;
};

// Generate the password for STK push
const generatePassword = (): string => {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  return Buffer.from(businessShortCode + passkey + timestamp).toString("base64");
};

// Generate the timestamp
const generateTimestamp = (): string => {
  return new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
};

// Fetch M-Pesa access token
const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa Consumer Key and Secret are required but missing.");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const response = await axios.get(`${mpesaAPIUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error("Error fetching M-Pesa access token:", error.response?.data || error.message);
    throw new Error("Failed to get M-Pesa access token.");
  }
};

// Initiate STK push payment
export const initiatePayment = async (phoneNumber: string, amount: number) => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log("Formatted Phone Number:", formattedPhone);

    // Get M-Pesa access token
    const accessToken = await getAccessToken();

    // Generate password and timestamp
    const password = generatePassword();
    const timestamp = generateTimestamp();

    // Build the STK push payload
    const payload = {
      BusinessShortCode: businessShortCode,  // Use the environment variable or default
      Password: password,                     // Correct password (base64 encoded)
      Timestamp: timestamp,                   // Correct timestamp
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,                         // The payment amount
      PartyA: formattedPhone,                 // Party A (the customer's phone number)
      PartyB: businessShortCode,             // Your business shortcode
      PhoneNumber: formattedPhone,            // Correct phone number format for the M-Pesa API
      CallBackURL: callbackURL,               // Replace with your actual callback URL
      AccountReference: "Cart Payment",      // A reference for the payment (could be dynamic)
      TransactionDesc: "Payment for cart items", // Description of the transaction
    };
    

    console.log("STK Push Request Payload:", payload);

    // Send STK push request
    const response = await axios.post(
      `${mpesaAPIUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log("STK Push Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error initiating payment:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment. Please try again.");
  }
};
