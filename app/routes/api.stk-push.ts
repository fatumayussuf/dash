import { json } from "@remix-run/node"
import { initiatePayment } from "~/services/paymentService"

export async function action({ request }: { request: Request }) {
  const { phoneNumber, amount } = await request.json()

  try {
    const result = await initiatePayment(phoneNumber, amount)
    return json({ status: "success", data: result })
  } catch (error) {
    console.error("Payment initiation failed:", error)
    return json({ status: "error", message: "Failed to initiate payment" }, { status: 500 })
  }
}

